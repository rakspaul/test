class Parsers::CoxCreative < Parsers::Base

  CREATIVES_SEPARATOR = /^==+\R/
  CREATIVE_NAME       = /Placement Name:.*\R/
  CREATIVE_HTML_CODE  = /JavaScript code:.*\R/

  def parse
    puts @tempfile.inspect
    content = File.read @tempfile
    creatives = content.split(CREATIVES_SEPARATOR).delete_if(&:empty?)
    creatives[1..2].each { |creative| parse_creative creatives }
  end

  def parse_creative creative_txt
    puts creative_txt.inspect
  end
end
