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

		@file_input = @file_input_class.new('public/template.xls')
    @fs = @poifs_class.new(@file_input)
    @book = @workbook_class.new(@fs)
    @worksheet = @book.getSheet('Insertion Order')
    
    @worksheet.getRow(17).getCell(2).setCellValue(@order.advertiser.name.to_s)
    @worksheet.getRow(18).getCell(2).setCellValue(@order.name.to_s)
    @worksheet.getRow(19).getCell(2).setCellValue(@order.source_id.to_i)
    @worksheet.getRow(24).getCell(6).setCellValue(@order.start_date.strftime("%m/%d/%Y"))
    @worksheet.getRow(25).getCell(6).setCellValue(@order.end_date.strftime("%m/%d/%Y"))

    row_no = LINE_ITEM_START_ROW
    row_shift_flag = 0
    existing_style = @worksheet.getRow(row_no).getCell(3).getCellStyle()
      
    @order.lineitems.each do |lineitem|
      if row_shift_flag == 1
        @worksheet.shiftRows(row_no,  @worksheet.getLastRowNum(), 1);
      end
      row = @worksheet.getRow(row_no)
      row.createCell(0).setCellValue(lineitem.start_date.strftime("%m/%d/%Y"))
      row.getCell(0).setCellStyle(existing_style)
      row.createCell(1).setCellValue(lineitem.end_date.strftime("%m/%d/%Y"))
      row.getCell(1).setCellStyle(existing_style)
      row.createCell(2).setCellValue(lineitem.ad_sizes.to_s)
      row.getCell(2).setCellStyle(existing_style)
      row.createCell(3).setCellStyle(existing_style)
      row.createCell(4).setCellValue(lineitem.volume.to_i)
      row.getCell(4).setCellStyle(existing_style)
      row.createCell(5).setCellValue(lineitem.rate.to_f)
      row.getCell(5).setCellStyle(existing_style)
      row.createCell(6).setCellValue(lineitem.value.to_f)
      row.getCell(6).setCellStyle(existing_style)
  
      row_no += 1
      row_shift_flag = 1
    end
    formula_for_total_impressions = "SUM(E#{LINE_ITEM_START_ROW+1}:E#{row_no})"
    formula_for_total_media_cost = "SUM(G#{LINE_ITEM_START_ROW+1}:G#{row_no})"
    formula_for_total_CPM = "G#{row_no+1}/E#{row_no+1}*1000"

		@worksheet.getRow(row_no).getCell(4).setCellFormula(formula_for_total_impressions)
		@worksheet.getRow(row_no).getCell(6).setCellFormula(formula_for_total_media_cost)
		@worksheet.getRow(row_no).getCell(5).setCellFormula(formula_for_total_CPM)

    evaluator = @book.getCreationHelper().createFormulaEvaluator();
    evaluator.evaluateFormulaCell(@worksheet.getRow(row_no).getCell(4))
    evaluator.evaluateFormulaCell(@worksheet.getRow(row_no).getCell(5))
    evaluator.evaluateFormulaCell(@worksheet.getRow(row_no).getCell(6))

    fileOut = @file_class.new("public/exports/#{@order.name.to_s.gsub( /\W/, '_' )}.xls")
    @book.write(fileOut)
    fileOut.close()
  end

  def get_order
  	@order = Order.of_network(@current_user.network)
             .includes(:advertiser).find(@order_id)
    if @order.nil?
    	raise "Order not found for given Id: #{@order_id}"
    end          
  end

  def get_file_path
  	return "public/exports/#{@order.name.to_s.gsub( /\W/, '_' )}.xls"
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
  
end