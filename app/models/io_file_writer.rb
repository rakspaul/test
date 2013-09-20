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
