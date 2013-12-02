class Parsers::CoxCreative < Parsers::Base

  CREATIVES_SEPARATOR = /^==+\R/
  CREATIVE_NAME       = /Placement Name:?<placement_name>(.*)\R/
  CREATIVE_HTML_CODE  = /JavaScript code:.*\R/

  def parse
    #puts @tempfile.inspect
    content = File.read @tempfile
    creatives = content.split(CREATIVES_SEPARATOR).delete_if(&:empty?)
    creatives[1..2].each { |creative| parse_creative creative }
  end

  def parse_creative creative_txt
    placement_name = creative_txt.match(CREATIVE_NAME).try(:placement_name).to_s.strip
    puts placement_name.inspect
  end
end
