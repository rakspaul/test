class Parsers::CoxCreative < Parsers::Base

  CREATIVES_SEPARATOR = /^==+\R/
  CREATIVE_NAME       = /Placement Name:(.*)\R/
  CREATIVE_HTML_CODE  = /JavaScript code:(.*)\r\n\r\n/m
  CREATIVE_START_DATE = /Placement Start Date:(.*)/
  CREATIVE_END_DATE   = /Placement End Date:(.*)/
  
  CREATIVE_TYPE       = "CustomCreative"

  def parse
    content = File.read @tempfile
    creatives = content.split(CREATIVES_SEPARATOR).delete_if(&:empty?)
    @creatives_errors = {}
    @creatives = []

    creatives.each_with_index { |creative, i| parse_creative(creative, i) }

    [@creatives, @creatives_errors]
  end

  def start_date(creative_txt)
    Date.strptime(creative_txt.match(CREATIVE_START_DATE)[1].to_s.strip, '%m/%d/%Y')
  end

  def end_date(creative_txt)
    Date.strptime(creative_txt.match(CREATIVE_END_DATE)[1].to_s.strip, '%m/%d/%Y')
  end

  def parse_creative(creative_txt, index)
    begin
      placement_name  = creative_txt.match(CREATIVE_NAME)[1].to_s.strip

      return if placement_name.nil?

      start_date      = start_date(creative_txt)
      end_date        = end_date(creative_txt)
      javascript_code = creative_txt.match(CREATIVE_HTML_CODE)[1].to_s.strip
      ad_size         = javascript_code.match(/{ "size" : "(\d+x\d+)"/)[1].to_s.strip
      width, height   = ad_size.split('x')
    rescue => e
      @creatives_errors[index] = "#{placement_name}: Error parsing creative's text: #{e.message}"
      return
    end

    if li = Lineitem.find_by(name: placement_name)
      Creative.transaction do
        creative = Creative.create name: li.ad_name(start_date, ad_size), network_advertiser_id: li.order.network_advertiser_id, size: ad_size, width: width, height: height, creative_type: CREATIVE_TYPE, redirect_url: "", html_code: javascript_code, network_id: li.order.network_id, data_source_id: 1

        li_assignment = LineitemAssignment.create lineitem: li, creative: creative, start_date: start_date, end_date: end_date, network_id: li.order.network_id, data_source_id: li.order.network.try(:data_source_id)

        if !li_assignment.errors.messages.blank?
          @creatives_errors[index] = li_assignment.errors.messages
          raise ActiveRecord::Rollback
        else
          @creatives << creative
        end
      end
    end
  end
end
