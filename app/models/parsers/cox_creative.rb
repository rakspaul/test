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
    @creatives_errors = []
    @creatives = []
    @old_li_creatives = {}
    creatives.each {|creative| find_old_creatives(creative) }

    creatives.each_with_index { |creative, i| parse_creative(creative, i) }

    @creatives_errors.push("#{@creatives_errors.count} of #{creatives.count} were not imported") if !@creatives_errors.empty?

    @old_li_creatives.each do |li, creatives|
      creatives.each{ |creative| creative.delete }
    end

    [@creatives, @creatives_errors]
  end

  def start_date(creative_txt)
    Date.strptime(creative_txt.match(CREATIVE_START_DATE)[1].to_s.strip, '%m/%d/%Y')
  end

  def end_date(creative_txt)
    Date.strptime(creative_txt.match(CREATIVE_END_DATE)[1].to_s.strip, '%m/%d/%Y')
  end

  def find_old_creatives(creative_txt)
    placement_name_match  = creative_txt.match(CREATIVE_NAME)
    return if placement_name_match.nil?
    placement_name  = placement_name_match[1].to_s.strip
    if li = Lineitem.find_by(name: placement_name)
      @old_li_creatives[li.id] = []
      @old_li_creatives[li.id] += li.creatives if !li.creatives.blank?
    end
  end

  def parse_creative(creative_txt, index)
    begin
      placement_name_match  = creative_txt.match(CREATIVE_NAME)

      return if placement_name_match.nil?

      placement_name  = placement_name_match[1].to_s.strip
      start_date      = start_date(creative_txt)
      end_date        = end_date(creative_txt)
      javascript_code = creative_txt.match(CREATIVE_HTML_CODE)[1].to_s.strip
      ad_size         = javascript_code.match(/{ "size" : "(\d+x\d+)"/)[1].to_s.strip
      width, height   = ad_size.split('x')
    rescue => e
      Rails.logger.warn e.backtrace.inspect
      @creatives_errors << "#{placement_name}: Error parsing creative's text: #{e.message}"
      return
    end

    if li = Lineitem.find_by(name: placement_name)
      Creative.transaction do
        creative = Creative.create name: li.ad_name(start_date, ad_size), network_advertiser_id: li.order.network_advertiser_id, size: ad_size, width: width, height: height, creative_type: CREATIVE_TYPE, redirect_url: "", html_code: javascript_code, network_id: li.order.network_id, data_source_id: 1

        li_assignment = LineitemAssignment.create lineitem: li, creative: creative, start_date: start_date, end_date: end_date, network_id: li.order.network_id, data_source_id: li.order.network.try(:data_source_id)

        if !li_assignment.errors.messages.blank?
          @creatives_errors << li_assignment.errors.messages
        else
          @creatives << creative
        end
      end
    else
      @creatives_errors << "#{index}: Lineitem with name \"#{placement_name}\" not found"
    end
  end
end
