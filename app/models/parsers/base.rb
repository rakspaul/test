class Parsers::Base
  include ActiveModel::Validations
  
  def initialize(file)
    @tempfile = File.new(File.join(Dir.tmpdir, 'IO_asset' + Time.current.to_i.to_s), 'w+')
    @tempfile.write File.read(file.path)
  end
end
