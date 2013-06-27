require 'roo'

class IoImport
  include ActiveModel::Validations

  LINE_ITEM_START_ROW = 29

  def initialize(file, current_user)
    @file = file
    @current_user = current_user
  end

  def save
    begin
      import_orders_and_lineitems
      errors.empty?
    rescue => e
     errors.add :base, e.message
     false
    end
  end

  def io_order
    @order
  end

  def import_orders_and_lineitems
    io_spreadsheet = open_excel_file
    io_spreadsheet.default_sheet = io_spreadsheet.sheets.first

    advertiser = read_advertiser(io_spreadsheet)

    @order = Order.new({
        name: io_spreadsheet.cell('C', 19).strip,
        start_date: io_spreadsheet.cell('G', 25),
        end_date: io_spreadsheet.cell('G', 26),
        user: @current_user,
        network: @current_user.network,
        advertiser: advertiser
      })

    if @order.valid?
      lineitems = read_lineitems(io_spreadsheet, @order, advertiser)
      if lineitems.map(&:valid?).all?
        @order.save!
        lineitems.each(&:save!)
      else
        lineitems.each_with_index do |lineitem, index|
          lineitem.errors.full_messages.each do |message|
            errors.add :base, "Row #{LINE_ITEM_START_ROW + index}: #{message}"
          end
        end
      end
    else
      @order.errors.full_messages.each do |message|
        errors.add :base, message
      end
    end
  end

  def read_advertiser(io_sheet)
    adv_name = io_sheet.cell('C', 18).strip
    advertiser = Advertiser.of_network(@current_user.network).find_by(name: adv_name)
    if advertiser.nil?
      raise "Advertiser not found: #{adv_name}"
    end

    advertiser
  end

  def read_lineitems(io_sheet, order, advertiser)
    row = LINE_ITEM_START_ROW
    lineitems = []

    until io_sheet.cell('A', row).nil?
      lineitem = Lineitem.new({
        start_date: io_sheet.cell('A', row),
        end_date: io_sheet.cell('B', row),
        ad_sizes: io_sheet.cell('C', row).strip.downcase,
        name: "#{advertiser.name} | #{order.name} | #{io_sheet.cell('D', row)}",
        volume: io_sheet.cell('E', row).to_i,
        rate: io_sheet.cell('F', row).to_f,
        order: order,
        user: @current_user
      })

      lineitems << lineitem
      row = row + 1
    end

    lineitems
  end

  def open_excel_file
    ext = File.extname(@file.original_filename)
    if ext != ".xlsx"
      raise "Unknown file type: #{@file.original_filename}"
    else
      Roo::Excelx.new(@file.path, nil, :ignore)
    end
  end
end
