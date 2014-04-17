class Parsers::Base
  include ActiveModel::Validations
  
  def initialize(file, order_id)
    @tempfile = File.new(File.join(Dir.tmpdir, 'IO_asset' + Time.current.to_i.to_s), 'w+')
    @tempfile.write File.read(file.path)
    @tempfile.flush
    @order_id  = order_id
    @original_filename = file.original_filename
  end
end
