require 'roo'

class IoImport
  include ActiveModel::Validations

  attr_reader :order

  def initialize(file, current_user)
    @reader = IOExcelFileReader.new(file)
    @current_user = current_user
  end

  def import
    @reader.open

    read_and_verify_advertiser
    read_order
    read_lineitems

    save
  rescue => e
    Rails.logger.error e.message + "\n" + e.backtrace.join("\n")
    errors.add :base, e.message
    false
  end

  private

    def read_and_verify_advertiser
      adv_name = @reader.advertiser_name
      @advertiser = Advertiser.of_network(@current_user.network).find_by(name: adv_name)
      if @advertiser.nil?
        raise "Advertiser not found: #{adv_name}"
      end
    end

    def read_order
      @order = Order.new(@reader.order)
      @order.user = @current_user
      @order.network = @current_user.network
      @order.advertiser = @advertiser
    end

    def read_lineitems
      @lineitems = []

      @reader.lineitems do |lineitem|
        li = Lineitem.new(lineitem)
        li.name = "#{@advertiser.name} | #{@order.name} | #{li.name}"
        li.order = @order
        li.user = @current_user
        @lineitems << li
      end
    end

    def save
      validate

      if errors.empty?
        @order.transaction do
          @order.save!
          @lineitems.each(&:save!)
          save_io_to_disk
        end
      end

      errors.empty?
    end

    def validate
      unless @order.valid?
        @order.errors.full_messages.each do |message|
          errors.add "Order", message
        end
      end

      unless @lineitems.map(&:valid?).all?
        @lineitems.each_with_index do |lineitem, index|
          lineitem.errors.full_messages.each do |message|
            errors.add "Lineitem", "Row #{IOExcelFileReader::LINE_ITEM_START_ROW + index}: #{message}"
          end
        end
      end

      if @lineitems.empty?
        errors.add "Lineitem", "No lineitems found."
      end
    end

    def save_io_to_disk
      writer = IOFileWriter.new("file_store/io_imports", @reader.file, @order)
      writer.write
    end
end

class IOFileWriter
  def initialize(location, file_object, order)
    @location = location
    @file = file_object
    @order = order
  end

  def write
    path = prepare_store_location
    File.open(path, "wb") {|f| f.write(@file.read) }

    @order.io_assets.create({asset_upload_name: @file.original_filename, asset_path: path})
  end

  private

    def prepare_store_location
      location = "#{@location}/#{@order.advertiser.id}"
      FileUtils.mkdir_p(location) unless Dir.exists?(location)

      file_name = "#{@order.id}_#{@order.io_assets.count}_#{@file.original_filename}"
      File.join(location, file_name)
    end
end

class IOExcelFileReader
  LINE_ITEM_START_ROW = 29
  DATE_FORMAT_WITH_SLASH = '%m/%d/%Y'
  DATE_FORMAT_WITH_DOT = '%m.%d.%Y'

  attr_reader :file

  def initialize(file_object)
    @file = file_object
  end

  def open
    @spreadsheet = open_based_on_file_extension
    @spreadsheet.default_sheet = @spreadsheet.sheets.first
  end

  def advertiser_name
    if @spreadsheet.cell('A', 19).to_s.strip =~ /advertiser name/i
      @spreadsheet.cell('C', 19).strip
    end
  end

  def order
    {
      name: @spreadsheet.cell('C', 18).strip,
      start_date: start_flight_date,
      end_date: finish_flight_date,
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
        volume: @spreadsheet.cell('E', row).to_i,
        rate: @spreadsheet.cell('F', row).to_f
      })

      row += 1
    end
  end

  def start_flight_date
    parse_date(@spreadsheet.cell('G', 25))
  end

  def finish_flight_date
    parse_date(@spreadsheet.cell('G', 26))
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
end

