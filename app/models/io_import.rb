require 'roo'
require 'pdf-reader'

class IoImport
  include ActiveModel::Validations

  attr_reader :order, :order_name_dup, :original_filename, :lineitems, :inreds, :advertiser, :io_details, :reach_client,
:account_contact, :media_contact, :trafficking_contact, :sales_person, :billing_contact,
:sales_person_unknown, :account_contact_unknown, :media_contact_unknown, :billing_contact_unknown, :tempfile,
:trafficking_contact_unknown, :notes

  def initialize(file, current_user)
    @tempfile             = File.new(File.join(Dir.tmpdir, 'IO_asset' + Time.current.to_i.to_s), 'w+')
    @tempfile.write File.read(file.path)

    @reader               = file.original_filename =~ /\.pdf$/ ? IOPdfFileReader.new(file.path) : IOExcelFileReader.new(file)

    @current_user         = current_user
    @original_filename    = file.original_filename
    @sales_person_unknown, @media_contact_unknown, @billing_contact_unknown, @account_manager_unknown, @trafficking_contact_unknown = [false, false, false, false, false]
    @account_contact      = Struct.new(:name, :phone, :email)
    @media_contact        = Struct.new(:name, :company, :address, :phone, :email)
    @sales_person         = Struct.new(:name, :phone, :email)
    @billing_contact      = Struct.new(:name, :company, :address, :phone, :email)
  end

  def import
    @reader.open

    read_advertiser

    read_account_contact
    read_media_contact
    read_billing_contact
    read_sales_person

    read_order_and_details
    read_lineitems
    read_inreds

    fix_order_flight_dates

    read_notes
  rescue => e
    Rails.logger.error e.message + "\n" + e.backtrace.join("\n")
    errors.add :base, e.message
    false
  end

  private

    def read_advertiser
      adv_name = @reader.advertiser_name
      @advertiser = Advertiser.of_network(@current_user.network).find_by(name: adv_name)
    end

    def read_account_contact
      @account_contact = @reader.account_contact
    end

    def read_media_contact
      @media_contact = @reader.media_contact
    end

    def read_sales_person
      @sales_person = @reader.sales_person
    end

    def read_billing_contact
      @billing_contact = @reader.billing_contact
    end

    def read_order_and_details
      @order = Order.new(@reader.order)
      @order.user = @current_user
      @order.network = @current_user.network
      @order.advertiser = @advertiser

      @order_name_dup = Order.exists?(name: @order.name)

      @reach_client = ReachClient.find_by(name: @reader.reach_client_name)

      @io_details = IoDetail.new
      @io_details.client_advertiser_name = @reader.advertiser_name
      @io_details.order = @order
      @io_details.state = "draft"
      @io_details.reach_client          = reach_client
      @io_details.sales_person          = find_sales_person
      @io_details.sales_person_email    = @reader.sales_person[:email]
      @io_details.sales_person_phone    = @reader.sales_person[:phone_number]
      @io_details.media_contact         = find_media_contact
      @io_details.billing_contact       = find_billing_contact
      @io_details.client_order_id       = @reader.client_order_id
      @io_details.account_manager       = find_account_contact
      @io_details.account_manager_email = @reader.account_contact[:email]
      @io_details.account_manager_phone = @reader.account_contact[:phone_number]
      @io_details.trafficking_contact   = find_trafficking_contact
    end

    def read_lineitems
      @lineitems = []

      @reader.lineitems do |lineitem|
        li = Lineitem.new(lineitem)
        li.order = @order
        li.user = @current_user
        @lineitems << li
      end
    end

    # order's start_date should be earliest of all lineitems, while end_date should be latest of all
    def fix_order_flight_dates
      if @lineitems.blank?
        @order.start_date = @reader.start_flight_date
        @order.end_date   = @reader.finish_flight_date
      else
        min_start, max_end = [@lineitems[0].start_date, @lineitems[0].end_date]
        @lineitems.each do |li|
          min_start = li.start_date if li.start_date < min_start
          max_end   = li.end_date   if li.end_date > max_end
        end
        @order.start_date = min_start
        @order.end_date   = max_end
      end

      @lineitems.to_a.each do |li|
        li_inreds = @inreds.select do |ir|
          ir[:placement] == li.name &&
          ir[:start_date] == li.start_date.to_date &&
          ir[:end_date]   == li.end_date.to_date
        end
        if li_inreds.empty?
          li.ad_sizes
        else
          li_inreds.map! do |creative|
            creative[:start_date] = li.start_date
            creative[:end_date]   = li.end_date
            creative[:creative_type] = "InternalRedirectCreative"
            creative
          end
        end
      end
    end

    def read_inreds
      @inreds = []
      @reader.inreds{|inred| @inreds << inred}
    end

    def read_notes
      # array with hash in it, because OrdersController#show also use this format
      @notes = [{note: @reader.find_notes, created_at: Time.current.to_s(:db), username: @current_user.try(:full_name) }]
    end

    def find_sales_person
      params = { first_name: @reader.sales_person[:first_name], last_name: @reader.sales_person[:last_name], email: @reader.sales_person[:email], phone_number: @reader.sales_person[:phone_number] }
      sp = @reach_client.try(:sales_person)

      if sp && sp.first_name == params[:first_name] && sp.last_name == params[:last_name]
        @reach_client.sales_person
      else
        @sales_person_unknown = true
        User.new params
      end
    end

    def find_trafficking_contact
      @trafficking_contact = {name: @current_user.full_name, email: @current_user.email, phone: @current_user.phone_number}
      @current_user
    end

    def find_account_contact
      params = { first_name: @reader.account_contact[:first_name], last_name: @reader.account_contact[:last_name], email: @reader.account_contact[:email], phone_number: @reader.account_contact[:phone_number] }
      am = @reach_client.try(:account_manager)

      if am && am.first_name == params[:first_name] && am.last_name == params[:last_name]
        @reach_client.account_manager
      else
        @account_contact_unknown = true
        User.new params
      end
    end

    def find_media_contact
      c = @reader.media_contact
      mc = MediaContact.where(name: c[:name], email: c[:email]).first
      if !mc
        @media_contact_unknown = true
        mc = MediaContact.new(name: c[:name], email: c[:email], phone: c[:phone])
      else
        mc.phone = c[:phone]
      end
      mc
    end

    def find_billing_contact
      c = @reader.billing_contact
      bc = BillingContact.where(name: c[:name], email: c[:email]).first
      if !bc
        @billing_contact_unknown = true
        bc = BillingContact.new(name: c[:name], email: c[:email], phone: c[:phone])
      else
        bc.phone = c[:phone]
      end
      bc
    end
end

class IOReader
  DATE_FORMAT_WITH_SLASH = '%m/%d/%Y'
  DATE_FORMAT_WITH_DOT = '%m.%d.%Y'

  LINEITEMS_TYPE = { 'Video'    => [ /^pre[ -]roll/i ],
    'Mobile'   => Mobile::DEFAULT_ADSIZES.map{|size| /#{size}/i },
    'Facebook' => Facebook::DEFAULT_ADSIZES.map{|size| /#{size}/i } }

  AD_SIZE_REGEXP = /\d+x\d+/i

  def split_name name
    parts = name.split(/\W+/)
    case parts.length
    when 0..1
      {first_name: name}
    when 2
      {first_name: parts[0], last_name: parts[1]}
    else
      {first_name: parts[0], last_name: parts[1..-1].join(' ') }
    end
  end

  def parse_date str
    return str if str.is_a?(Date)

    if str.index('-')
      Date.strptime(str.squish)
    elsif str.index('.')
      Date.strptime(str.squish, DATE_FORMAT_WITH_DOT)
    elsif str.squish.split('/').try(:last).try(:length) == 2
      Date.strptime(str.squish, DATE_FORMAT_WITH_SLASH_2DIGIT_YEAR)
    else
      Date.strptime(str.squish, DATE_FORMAT_WITH_SLASH)
    end
  rescue
    nil
  end

  def determine_lineitem_type(ad_format)
    type = LINEITEMS_TYPE.find do |type, formats|
      formats.any?{ |format| ad_format =~ format }
    end
    type ? type[0] : 'Display'
  end 

  def parse_ad_sizes(str, type)
    case type 
    when 'Display'
      str    
    when 'Video'
      ([ Video::DEFAULT_MASTER_ADSIZE ] + str.scan(AD_SIZE_REGEXP)).join(',')
    else
      str.scan(AD_SIZE_REGEXP).first
    end
  end
end

class IOExcelFileReader < IOReader
  LINE_ITEM_START_ROW = 29

  ADVERTISER_LABEL_CELL           = ['A', 18]
  ADVERTISER_CELL                 = ['C', 18]
  ORDER_NAME_CELL                 = ['C', 19]
  ORDER_START_FLIGHT_DATE         = ['H', 25]
  ORDER_END_FLIGHT_DATE           = ['H', 26]

  ACCOUNT_CONTACT_NAME_CELL       = ['E', 12]
  ACCOUNT_CONTACT_PHONE_CELL      = ['E', 13]
  ACCOUNT_CONTACT_EMAIL_CELL      = ['E', 14]

  MEDIA_CONTACT_NAME_CELL         = ['E', 17]
  MEDIA_CONTACT_COMPANY_CELL      = ['E', 18]
  MEDIA_CONTACT_ADDRESS_CELL      = ['E', 19]
  MEDIA_CONTACT_PHONE_CELL        = ['E', 20]
  MEDIA_CONTACT_EMAIL_CELL        = ['E', 21]

  TRAFFICKING_CONTACT_NAME_CELL   = ['G', 12]
  TRAFFICKING_CONTACT_PHONE_CELL  = ['G', 13]
  TRAFFICKING_CONTACT_EMAIL_CELL  = ['G', 14]

  SALES_PERSON_NAME_CELL          = ['C', 12]
  SALES_PERSON_PHONE_CELL         = ['C', 13]
  SALES_PERSON_EMAIL_CELL         = ['C', 14]

  BILLING_CONTACT_NAME_CELL       = ['G', 17]
  BILLING_CONTACT_COMPANY_CELL    = ['G', 18]
  BILLING_CONTACT_ADDRESS_CELL    = ['G', 19]
  BILLING_CONTACT_PHONE_CELL      = ['G', 20]
  BILLING_CONTACT_EMAIL_CELL      = ['G', 21]

  CLIENT_ORDER_ID_CELL            = ['C', 20]

  REACH_CLIENT_CELL               = ['G', 18]

  INREDS_SPREADSHEET_PAGE         = 1
  INREDS_SPREADSHEET_NAME         = 'InRed Creation'
  INREDS_START_ROW                = 4
  INREDS_AD_ID_COLUMN             = 'E'
  INREDS_PLACEMENT_COLUMN         = 'G'
  INREDS_AD_SIZE_COLUMN           = 'H'
  INREDS_START_DATE_COLUMN        = 'I'
  INREDS_END_DATE_COLUMN          = 'J'
  INREDS_IMAGE_URL_COLUMN         = 'K'
  INREDS_CLICK_URL_COLUMN         = 'L'

  attr_reader :file

  def initialize(file_object)
    @file = file_object
  end

  def open
    @spreadsheet = open_based_on_file_extension
    @spreadsheet.default_sheet = @spreadsheet.sheets.first
  end

  def change_sheet(num, &block)
    default_sheet = @spreadsheet.default_sheet
    @spreadsheet.default_sheet = @spreadsheet.sheets[num]
    yield
    @spreadsheet.default_sheet = default_sheet
  end

  def client_order_id
    @spreadsheet.cell(*CLIENT_ORDER_ID_CELL).to_i
  end

  def reach_client_name
    @spreadsheet.cell(*REACH_CLIENT_CELL).to_s.strip
  end

  def advertiser_name
    if @spreadsheet.cell(*ADVERTISER_LABEL_CELL).to_s.strip =~ /advertiser name/i
      @spreadsheet.cell(*ADVERTISER_CELL).to_s.strip
    end
  end

  def account_contact
    {
      phone_number: @spreadsheet.cell(*ACCOUNT_CONTACT_PHONE_CELL).to_s.strip,
      email: @spreadsheet.cell(*ACCOUNT_CONTACT_EMAIL_CELL).to_s.strip
    }.merge split_name(@spreadsheet.cell(*ACCOUNT_CONTACT_NAME_CELL).to_s.strip)
  end

  def media_contact
    {
      name: @spreadsheet.cell(*MEDIA_CONTACT_NAME_CELL).to_s.strip,
      #company: @spreadsheet.cell(*MEDIA_CONTACT_COMPANY_CELL).to_s.strip,
      #address: @spreadsheet.cell(*MEDIA_CONTACT_ADDRESS_CELL).to_s.strip,
      phone: @spreadsheet.cell(*MEDIA_CONTACT_PHONE_CELL).to_s.strip,
      email: @spreadsheet.cell(*MEDIA_CONTACT_EMAIL_CELL).to_s.strip
    }
  end

  def sales_person
    {
      account_login: @spreadsheet.cell(*SALES_PERSON_NAME_CELL).to_s.strip.downcase.delete(" "),
      phone_number: @spreadsheet.cell(*SALES_PERSON_PHONE_CELL).to_s.strip,
      email: @spreadsheet.cell(*SALES_PERSON_EMAIL_CELL).to_s.strip
    }.merge split_name(@spreadsheet.cell(*SALES_PERSON_NAME_CELL).to_s.strip)
  end

  def billing_contact
    {
      name: @spreadsheet.cell(*BILLING_CONTACT_NAME_CELL).to_s.strip,
      #company: @spreadsheet.cell(*BILLING_CONTACT_COMPANY_CELL).to_s.strip,
      #address: @spreadsheet.cell(*BILLING_CONTACT_ADDRESS_CELL).to_s.strip,
      phone: @spreadsheet.cell(*BILLING_CONTACT_PHONE_CELL).to_s.strip,
      email: @spreadsheet.cell(*BILLING_CONTACT_EMAIL_CELL).to_s.strip
    }
  end

  def order
    {
      name: @spreadsheet.cell(*ORDER_NAME_CELL).to_s.strip
    }
  end

  def start_flight_date
    parse_date(@spreadsheet.cell(*ORDER_START_FLIGHT_DATE))
  end

  def finish_flight_date
    parse_date(@spreadsheet.cell(*ORDER_END_FLIGHT_DATE))
  end

  def lineitems
    row = LINE_ITEM_START_ROW
    while (cell = @spreadsheet.cell('A', row)) && cell.present? && parse_date(cell).instance_of?(Date)
      ad_sizes = @spreadsheet.cell('C', row).strip.downcase
      type = determine_lineitem_type(ad_sizes)
      yield({
        start_date: parse_date(@spreadsheet.cell('A', row)),
        end_date: parse_date(@spreadsheet.cell('B', row)),
        ad_sizes: parse_ad_sizes(ad_sizes, type),
        name: @spreadsheet.cell('D', row).to_s.strip,
        volume: @spreadsheet.cell('F', row).to_i,
        rate: @spreadsheet.cell('G', row).to_f,
        type: type
      })

      row += 1
    end
  end

  def find_notes
    row = LINE_ITEM_START_ROW
    while !@spreadsheet.cell('A', row).to_s.match(/^notes/i)
      row += 1
    end
    @spreadsheet.cell('B', row)
  end

  def inreds
    return if @spreadsheet.sheets[INREDS_SPREADSHEET_PAGE] != INREDS_SPREADSHEET_NAME
    row = INREDS_START_ROW

    change_sheet INREDS_SPREADSHEET_PAGE do

      while (cell = @spreadsheet.cell(INREDS_IMAGE_URL_COLUMN, row)) && !cell.blank?
        ad_size = @spreadsheet.cell(INREDS_AD_SIZE_COLUMN, row)
        yield({
          ad_id: @spreadsheet.cell(INREDS_AD_ID_COLUMN, row).to_i,
          start_date: parse_date(@spreadsheet.cell(INREDS_START_DATE_COLUMN, row)),
          end_date: parse_date(@spreadsheet.cell(INREDS_END_DATE_COLUMN, row)),
          ad_size: ad_size.strip.downcase,
          placement: @spreadsheet.cell(INREDS_PLACEMENT_COLUMN, row).to_s.strip,
          image_url: @spreadsheet.cell(INREDS_IMAGE_URL_COLUMN, row).to_s.strip,
          click_url: @spreadsheet.cell(INREDS_CLICK_URL_COLUMN, row).to_s.strip
        }) if ! ad_size.blank?

        row += 1
      end
    end
  end

private

  def open_based_on_file_extension
    ext = File.extname(@file.original_filename)
    case ext
    when '.xls'
      Roo::Excel.new(@file.path, nil, :ignore)
    when '.xlsx'
      Roo::Excelx.new(@file.path, nil, :ignore)
    else
      raise "Unknown file type: #{@file.original_filename}"
    end
  end
end

class IOPdfFileReader < IOReader
  def initialize(file_object)
    @file = file_object
    parse_file
  end

  def open
  end

  def change_sheet(num, &block)
    yield
  end

  def client_order_id
    @client_order_id.to_i
  end

  def reach_client_name
    @reach_client_name.to_s.strip
  end

  def advertiser_name
    @advertiser_name.to_s.strip   
  end

  def account_contact
    {
      phone_number: @account_contact.to_s.strip,
      email: @account_contact_email.to_s.strip
    }.merge split_name(@account_contact_name.to_s.strip)
  end

  def media_contact
    {
      name: @media_contact_name.to_s.strip,
      phone: @media_contact_phone.to_s.strip,
      email: @media_contact_email.to_s.strip
    }
  end

  def sales_person
    user = User.find_by first_name: "Peter", last_name: "Fernquist"
    if user
      {
        phone_number: user.phone_number,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    else
      { phone_number: "", email: "", first_name: "", last_name: "" }
    end
  end

  def billing_contact
    {
      name: @billing_contact_name.to_s.strip,
      phone: @billing_contact_phone.to_s.strip,
      email: @billing_contact_email.to_s.strip
    }
  end

  def order
    {
      name: @order_name.to_s.strip
    }
  end

  def start_flight_date
    parse_date(@start_date)
  end

  def finish_flight_date
    parse_date(@end_date)
  end

  def lineitems 
    @lineitems.each do |li|
      yield({
        start_date: parse_date(li[:start_date]),
        end_date: parse_date(li[:end_date]),
        ad_sizes:  li[:ad_sizes].join(',').strip.downcase,
        name: li[:name].to_s.strip,
        volume: li[:impressions].to_i,
        rate: li[:rate].to_f
      })
    end
  end

  def find_notes
    @notes
  end

  def inreds
    yield({})
  end

private

  def parse_file 
    @reach_client_name = "Cox Digital Solutions"

    @reader = PDF::Reader::Turtletext.new @file, { :y_precision => 5 }
    @raw_reader = PDF::Reader.new @file

    textangle = @reader.bounding_box do
      page 1
      right_of /advertiser/i
      left_of /bill to/i
      below /campaign information/i
      above /campaign name/i
    end
    @client_advertiser_name = textangle.text[0][0]
    @advertiser_name = @client_advertiser_name

    textangle = @reader.bounding_box do
      page 1
      below /advertiser/i
      above /campaign io number/i
      left_of /frequency/i
      right_of /campaign name/i
    end
    @order_name = textangle.text[0][0]

    textangle = @reader.bounding_box do
      page 1
      below /io version number/i
      above /account manager email/i
      right_of /account manager/i
    end
    @media_contact_name = textangle.text[0][0]
   
    textangle = @reader.bounding_box do
      page 1
      below /account manager/i
      above /am phone/i
      left_of /address/i
    end
    @media_contact_email = textangle.text[0][1]

    textangle = @reader.bounding_box do
      page 1
      below /account manager email/i
      above "AM Fax"
      right_of "AM Phone"
    end
    @media_contact_phone = textangle.text[0][0]

    textangle = @reader.bounding_box do
      page 1
      below /frequency/i
      right_of /billing contact/i
    end
    @billing = textangle.text
    @billing_contact_name = @billing[0][0]
    @billing_contact_email = @billing[1][0]
    @billing_contact_phone = @billing[2][0]

     
    @lineitems = merge(search_for_placement_and_li_id, search_for_dates)
    @lineitems = merge(@lineitems, search_for_ad_sizes)

    # find out order's flight dates based on LIs' flight dates
    @start_date = @lineitems[0][:start_date]
    @end_date   = @lineitems[0][:end_date]
    @lineitems.each do |li|
      @start_date = li[:start_date] if li[:start_date] < @start_date
      @end_date = li[:end_date] if li[:end_date] > @end_date
    end   
  end

  def merge(hash1, hash2)
    hash1.each.with_index do |h, i|
      hash2[i].merge! h
    end
    hash2
  end

  def search_for_dates
    dates = []
    @raw_reader.pages.count.times do |i|
      textangle = @reader.bounding_box do
        page (i+1)
        below /Start/
        right_of /site:/i
      end
      dates += textangle.text
    end

    lineitems = []
    dates.each_with_index do |line, i|
      li = {}
      if line.first =~ /\d{1,2}\/\d{1,2}\/\d{2,4}/
        li[:start_date]    = line[0]
        li[:end_date]      = line[1]
        li[:impressions]   = line[2].gsub(/,/, '')
        li[:rate]          = line[4].gsub(/,|\$/,'')
        li[:type]          = line[3]
        li[:total]         = line[5].gsub(/,|\$/,'')
        li[:notes]         = line[6]
        lineitems << li
      else
        line = ' ' + line.join(' ')
        lineitems.last[:notes] += line if line !~ /Page \d+ of \d+/
      end     
    end

    lineitems
  end

  def search_for_placement_and_li_id
    placements = []
    @raw_reader.pages.count.times do |i|
      textangle = @reader.bounding_box do
        page (i+1)
        below /End/
        left_of /site:/i
      end
      placements += textangle.text
    end

    lineitems = []
    split_index = placements.index(["Contracts Totals"])
    all_lineitems = split_index ? placements[0...split_index] : placements
    all_lineitems.reject{|t| [["ID"], ["Line Item"]].include?(t)}.each do |line|
      li = {}
      if line[1] && line[1].match(/^\d+$/)
        li[:name] = line[0]
        li[:li_id] = line[1]
        lineitems << li
      else
        lineitems.last[:name] += line.join(' ')
      end
    end
    lineitems
  end

  def search_for_ad_sizes
    ad_sizes_raw = []

    @raw_reader.pages.count.times do |i|
      textangle = @reader.bounding_box do
        page (i+1)
        below /section:/i
      end
      ad_sizes_raw += textangle.text
    end
    ad_sizes_raw = ad_sizes_raw.flatten.reject{|size| size !~ /\d+x\d+/mi}
    
    lineitems = []
    ad_sizes_raw.each do |line|
      li = {}
      if line =~ /Ad Size\(s\):/
        li[:ad_sizes] = line.scan(/\d+x\d+/mi)
        lineitems << li
      elsif line =~ /[\dx\s,]/mi
        lineitems.last[:ad_sizes] += line.scan(/\d+x\d+/mi)
      end
    end

    lineitems.map do |ad_sizes|
      ad_sizes[:ad_sizes].uniq!
    end

    lineitems
  end
end
