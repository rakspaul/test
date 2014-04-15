require 'diff/lcs'

class Parsers::CoxCreative < Parsers::Base

  CREATIVES_SEPARATOR = /^==+\R/
  CREATIVE_NAME       = /Placement Name:(.*)\R/
  CREATIVE_HTML_CODE  = /JavaScript code:(.*)?(\r\n)?(\r\n)?/m
  CREATIVE_START_DATE = /Placement Start Date:(.*)/
  CREATIVE_END_DATE   = /Placement End Date:(.*)/
  
  CREATIVE_TYPE       = "ThirdPartyCreative"

  def parse
    content = File.read @tempfile

    creatives = content.split(CREATIVES_SEPARATOR).delete_if(&:empty?)
    creatives.shift if creatives[0].match(/Cox Digital Solutions Ad Tags/m) # remove metainfirmation

    @creatives_errors = []
    @creatives = []
    @old_li_creatives = {}
    creatives.each {|creative| find_old_creatives(creative) }

    creatives.each_with_index { |creative, i| parse_creative(creative, i) }

    @creatives_errors.push("#{@creatives_errors.count} of #{creatives.count} were not imported") if !@creatives_errors.empty?

    @old_li_creatives.each do |li, creatives|
      creatives.each{ |creative| creative.delete }
    end

    if @creatives_errors.empty?
      order = Order.find_by(id: @order_id)
      file = File.open @tempfile
      writer = IOFileWriter.new("file_store/io_imports", file, @original_filename, order, 'creatives')
      writer.write
      file.close
      File.unlink(file.path)
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
    if li = Lineitem.find_by(name: placement_name, order_id: @order_id)
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

    lis = Order.find(@order_id).lineitems
    if !lis.blank?
      matched_li = nil
      lis.each do |li| 
        diff = Diff::LCS.diff(li.name, placement_name)
        # if there is no difference between LI name and creative placement name
        if diff.empty?
          matched_li = li
          break
        # or there is additional or no blankspace 
        elsif diff.length == 1 && diff.last.try(:last).try(:element) == " "
          matched_li = li
          break
        end
      end

      # then we found LI to replace creatives
      if matched_li
        Creative.transaction do
          creative = Creative.create name: matched_li.ad_name(start_date, ad_size), network_advertiser_id: matched_li.order.network_advertiser_id, size: ad_size, width: width, height: height, creative_type: CREATIVE_TYPE, redirect_url: "", html_code: javascript_code, network_id: matched_li.order.network_id, data_source_id: 1

          li_assignment = LineitemAssignment.create lineitem: matched_li, creative: creative, start_date: start_date, end_date: end_date, network_id: matched_li.order.network_id, data_source_id: matched_li.order.network.try(:data_source_id)

          if !li_assignment.errors.messages.blank?
            @creatives_errors << "#{index+1}: "+li_assignment.errors.full_messages.join('; ')
          else
            @creatives << creative
          end
        end
      end
    else
      @creatives_errors << "#{index+1}: Lineitem with name \"#{placement_name}\" not found"
    end
  end
end
