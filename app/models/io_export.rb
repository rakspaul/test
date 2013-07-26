class IoExport
  include ActiveModel::Validations

  LINE_ITEM_START_ROW = 28

  def initialize(order_id, current_user)
    @order_id = order_id
    @current_user = current_user
  end

  def import_java_classes
    # JVM loading
    apache_poi_path = 'lib/jars/poi-3.5-FINAL-20090928.jar'
    Rjb::load("#{apache_poi_path}", ['-Xmx512M'])

    # Java classes import 
    @file_class = Rjb::import('java.io.FileOutputStream')
    @file_input_class = Rjb::import('java.io.FileInputStream')
    @workbook_class = Rjb::import('org.apache.poi.hssf.usermodel.HSSFWorkbook')
    @poifs_class = Rjb::import('org.apache.poi.poifs.filesystem.POIFSFileSystem')
  end

  def export_io_file
    import_java_classes
    get_order
    get_sales_person

    @file_input = @file_input_class.new('public/template.xls')
    @fs = @poifs_class.new(@file_input)
    @book = @workbook_class.new(@fs)
    @worksheet = @book.getSheet('Insertion Order')
    @worksheet.getRow(11).getCell(2).setCellValue(@sales_person.name) unless @sales_person.nil?
    @worksheet.getRow(17).getCell(2).setCellValue(@order.advertiser.name.to_s)
    @worksheet.getRow(18).getCell(2).setCellValue(@order.name.to_s)
    @worksheet.getRow(19).getCell(2).setCellValue(@order.source_id.to_i)
    @worksheet.getRow(24).getCell(6).setCellValue(@order.start_date.strftime("%m/%d/%Y"))
    @worksheet.getRow(25).getCell(6).setCellValue(@order.end_date.strftime("%m/%d/%Y"))

    row_no = LINE_ITEM_START_ROW
    row_shift_flag = 0
    existing_style = @worksheet.getRow(row_no).getCell(3).getCellStyle()
    evaluator = @book.getCreationHelper().createFormulaEvaluator();

    @order.lineitems.each do |lineitem|
      if row_shift_flag == 1
        @worksheet.shiftRows(row_no,  @worksheet.getLastRowNum(), 1);
      end

      row = @worksheet.getRow(row_no)
      row.createCell(0).setCellValue(lineitem.start_date.strftime("%m/%d/%Y"))
      row.createCell(1).setCellValue(lineitem.end_date.strftime("%m/%d/%Y"))
      row.createCell(2).setCellValue(lineitem.ad_sizes.to_s)
      row.createCell(4).setCellValue(lineitem.volume.to_i)
      row.createCell(5).setCellValue(lineitem.rate.to_f)

      formula_for_media_cost = "(E#{row_no + 1}/1000)*F#{row_no + 1}"
      row.createCell(6).setCellFormula(formula_for_media_cost)
      evaluator.evaluateFormulaCell(row.getCell(6))
      
      add_cell_styles(row,existing_style)
      row_no += 1
      row_shift_flag = 1
    end

    if row_no != LINE_ITEM_START_ROW
      add_formulas(row_no,evaluator)
    end
    
    save_io_to_disk
  end

  def save_io_to_disk
      writer = IOFileWriter.new("file_store/io_exports", @book, @order)
      @io_asset = writer.write
  end

  def get_order
    @order = Order.of_network(@current_user.network)
             .includes(:advertiser).find(@order_id)
    if @order.nil?
      raise "Order not found for given Id: #{@order_id}"
    end          
  end

  def get_sales_person
    @sales_person = SalesPeople.find_by_id(@order.sales_person_id)
  end

  def export_order
    begin
      export_io_file
      errors.empty?
    rescue => e
      errors.add :base, e.message
      false
    end
  end

  def get_file_path
    @io_asset.asset_path
  end

  def add_cell_styles(row,existing_style)
    impressions_cell_style = @book.createCellStyle()
    impressions_cell_style.cloneStyleFrom(existing_style)
    impressions_cell_style.setDataFormat(@book.createDataFormat().getFormat("#,##0"))

    cost_cell_style = @book.createCellStyle()
    cost_cell_style.cloneStyleFrom(existing_style)
    cost_cell_style.setDataFormat(@book.createDataFormat().getFormat("$#,##0.00"))

    row.getCell(0).setCellStyle(existing_style)
    row.getCell(1).setCellStyle(existing_style)
    row.getCell(2).setCellStyle(existing_style)
    row.createCell(3).setCellStyle(existing_style)
    row.getCell(4).setCellStyle(impressions_cell_style) 
    row.getCell(5).setCellStyle(cost_cell_style)
    row.getCell(6).setCellStyle(cost_cell_style)
  end

  def add_formulas(row_no,evaluator)
    formula_for_total_impressions = "SUM(E#{LINE_ITEM_START_ROW+1}:E#{row_no})"
    formula_for_total_media_cost = "SUM(G#{LINE_ITEM_START_ROW+1}:G#{row_no})"
    formula_for_total_CPM = "G#{row_no+1}/E#{row_no+1}*1000"

    @worksheet.getRow(25).getCell(2).setCellFormula("G#{row_no+1}")
    totals_row = @worksheet.getRow(row_no)
    totals_row.getCell(4).setCellFormula(formula_for_total_impressions)
    totals_row.getCell(6).setCellFormula(formula_for_total_media_cost)
    totals_row.getCell(5).setCellFormula(formula_for_total_CPM)
    
    evaluator.evaluateFormulaCell(@worksheet.getRow(25).getCell(2))
    evaluator.evaluateFormulaCell(totals_row.getCell(4))
    evaluator.evaluateFormulaCell(totals_row.getCell(5))
    evaluator.evaluateFormulaCell(totals_row.getCell(6))

  end
  
end

class IOFileWriter
  def initialize(location, file_object, order)
    @file_class = Rjb::import('java.io.FileOutputStream')
    @location = location
    @file = file_object
    @order = order
  end

  def write
    path = prepare_store_location
    fileOut = @file_class.new(path)
    @file.write(fileOut)
    fileOut.close()

    @order.io_assets.create({asset_upload_name: get_file_name, asset_path: path})
  end

  private

    def prepare_store_location
      location = "#{@location}/#{@order.advertiser.id}"
      FileUtils.mkdir_p(location) unless Dir.exists?(location)
    
      return "#{location}/#{get_file_name}"    
    end

    def get_file_name
      return "#{@order.id}_#{@order.io_assets.count}_#{@order.name.to_s.gsub( /\W/, '_' )}.xls"
    end
end
