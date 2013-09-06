require 'roo'

class IoImport
  include ActiveModel::Validations

  attr_reader :order, :original_filename, :lineitems, :advertiser, :io_details, :reach_client,
:account_contact, :media_contact, :trafficking_contact, :sales_person, :billing_contact,
:sales_person_unknown, :account_contact_unknown, :media_contact_unknown, :billing_contact_unknown, :tempfile

  def initialize(file, current_user)
    @tempfile             = File.new(File.join(Dir.tmpdir, 'IO_asset' + Time.current.to_i.to_s), 'w+')
    @tempfile.write File.read(file.path)

    @reader               = IOExcelFileReader.new(file)
    @current_user         = current_user
    @original_filename    = file.original_filename
    @sales_person_unknown, @media_contact_unknown, @billing_contact_unknown, @account_manager_unknown = [false, false, false, false]
    @account_contact      = Struct.new(:name, :phone, :email)
    @media_contact        = Struct.new(:name, :company, :address, :phone, :email)
    @trafficking_contact  = Struct.new(:name, :phone, :email)
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
    read_trafficking_contact

    read_order_and_details
    read_lineitems
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

    def read_trafficking_contact
      @trafficking_contact = @reader.trafficking_contact
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

      @reach_client = ReachClient.find_by(name: @reader.reach_client_name)

      @io_details = IoDetail.new :overall_status => :draft, :trafficking_status => :unreviewed, :account_manager_status => :unreviewed
      @io_details.client_advertiser_name = @reader.advertiser_name
      @io_details.order = @order
      @io_details.reach_client         = reach_client
      @io_details.sales_person         = find_sales_person
      @io_details.media_contact        = find_media_contact
      @io_details.billing_contact      = find_billing_contact
      @io_details.client_order_id      = @reader.client_order_id
      @io_details.account_manager      = find_account_contact

      @io_details.trafficking_contact  = User.find_or_initialize_by(first_name: @reader.trafficking_contact[:first_name], last_name: @reader.trafficking_contact[:last_name], phone_number: @reader.trafficking_contact[:phone_number], email: @reader.trafficking_contact[:email])
    end

    def read_lineitems
      @lineitems = []

      @reader.lineitems do |lineitem|
        li = Lineitem.new(lineitem)
        li.name = [@advertiser.try(:name), li.name].compact.join(' | ')
        li.order = @order
        li.user = @current_user
        @lineitems << li
      end
    end

    def find_sales_person
      params = { first_name: @reader.sales_person[:first_name], last_name: @reader.sales_person[:last_name], email: @reader.sales_person[:email], phone_number: @reader.sales_person[:phone_number] }
      sp = @reach_client.sales_person

      if sp && sp.first_name == params[:first_name] && sp.last_name == params[:last_name]
        @reach_client.sales_person
      else
        @sales_person_unknown = true
        User.new params
      end
    end

    def find_account_contact
      params = { first_name: @reader.account_contact[:first_name], last_name: @reader.account_contact[:last_name], email: @reader.account_contact[:email], phone_number: @reader.account_contact[:phone_number] }
      am = @reach_client.account_manager

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
      end
      mc
    end

    def find_billing_contact
      c = @reader.billing_contact
      bc = BillingContact.where(name: c[:name], email: c[:email]).first
      if !bc
        @billing_contact_unknown = true
        bc = BillingContact.new(name: c[:name], email: c[:email], phone: c[:phone])
      end
      bc
    end
end

class IOFileWriter
  def initialize(location, file_object, original_filename, order)
    @location = location
    @file = file_object
    @order = order
    @original_filename = original_filename
  end

  def write
    path = prepare_store_location
    File.open(path, "wb") {|f| f.write(@file.read) }

    @order.io_assets.create({asset_upload_name: @original_filename, asset_path: path})
  end

  private

    def prepare_store_location
      location = "#{@location}/#{@order.advertiser.id}"
      FileUtils.mkdir_p(location) unless Dir.exists?(location)

      file_name = "#{@order.id}_#{@order.io_assets.count}_#{@original_filename}"
      File.join(location, file_name)
    end
end

class IOExcelFileReader
  LINE_ITEM_START_ROW = 29
  DATE_FORMAT_WITH_SLASH = '%m/%d/%Y'
  DATE_FORMAT_WITH_DOT = '%m.%d.%Y'

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

  attr_reader :file

  def initialize(file_object)
    @file = file_object
  end

  def open
    @spreadsheet = open_based_on_file_extension
    @spreadsheet.default_sheet = @spreadsheet.sheets.first
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

  def trafficking_contact
    {
      phone_number: @spreadsheet.cell(*TRAFFICKING_CONTACT_PHONE_CELL).to_s.strip,
      email: @spreadsheet.cell(*TRAFFICKING_CONTACT_EMAIL_CELL).to_s.strip
    }.merge split_name(@spreadsheet.cell(*TRAFFICKING_CONTACT_NAME_CELL).to_s.strip)
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
      name: @spreadsheet.cell(*ORDER_NAME_CELL).to_s.strip,
      start_date: start_flight_date,
      end_date: finish_flight_date
    }
  end

  def lineitems
    row = LINE_ITEM_START_ROW
    while (cell = @spreadsheet.cell('A', row)) && cell.present? && parse_date(cell).instance_of?(Date)
      yield({
        start_date: parse_date(@spreadsheet.cell('A', row)),
        end_date: parse_date(@spreadsheet.cell('B', row)),
        ad_sizes: @spreadsheet.cell('C', row).strip.downcase,
        name: @spreadsheet.cell('D', row).to_s.strip,
        volume: @spreadsheet.cell('F', row).to_i,
        rate: @spreadsheet.cell('G', row).to_f
      })

      row += 1
    end
  end

  def start_flight_date
    parse_date(@spreadsheet.cell(*ORDER_START_FLIGHT_DATE))
  end

  def finish_flight_date
    parse_date(@spreadsheet.cell(*ORDER_END_FLIGHT_DATE))
  end

  private

    def parse_date str
      return str if str.is_a?(Date)

      Date.strptime(str.strip, str.index('.') ? DATE_FORMAT_WITH_DOT : DATE_FORMAT_WITH_SLASH)
    rescue
      nil
    end

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
end

