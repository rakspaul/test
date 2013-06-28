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
    @io_sheet = open_excel_file
    @io_sheet.default_sheet = @io_sheet.sheets.first

    read_advertiser
    read_order

    if @order.valid?
      lineitems = read_lineitems

      raise "No line items found in #{@file.original_filename}." if lineitems.empty?

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

  def read_advertiser
    adv_name = @io_sheet.cell('D', 18).strip
    @advertiser = Advertiser.of_network(@current_user.network).find_by(name: adv_name)
    if @advertiser.nil?
      raise "Advertiser not found: #{adv_name}"
    end
  end

  def read_order
    @order = Order.new({
        name: @io_sheet.cell('C', 19).strip,
        start_date: @io_sheet.cell('G', 25),
        end_date: @io_sheet.cell('G', 26),
        user: @current_user,
        network: @current_user.network,
        advertiser: @advertiser
      })
  end

  def read_lineitems
    row = LINE_ITEM_START_ROW
    lineitems = []

    while @io_sheet.cell('A', row).instance_of? Date
      lineitem = Lineitem.new({
        start_date: @io_sheet.cell('A', row),
        end_date: @io_sheet.cell('B', row),
        ad_sizes: @io_sheet.cell('C', row).strip.downcase,
        name: "#{@advertiser.name} | #{@order.name} | #{@io_sheet.cell('D', row)}",
        volume: @io_sheet.cell('E', row).to_i,
        rate: @io_sheet.cell('F', row).to_f,
        order: @order,
        user: @current_user
      })

      lineitems << lineitem
      row = row + 1
    end

    lineitems
  end

  def open_excel_file
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
