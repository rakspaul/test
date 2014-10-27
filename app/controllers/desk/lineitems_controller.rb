class Desk::LineitemsController < LineitemsController

  include Desk::CommonHelper

  before_filter :add_default_filter, :only => [:index]

  private

  def set_lineitem_status(lineitems)
    lineitems.each do |lineitem|
      lineitem.ads.load

      ads_count = lineitem.ads.inject(0) {|count| count = count + 1; count}
      
      if  ads_count > 0

        if lineitem.ads.select{|ad| ad.status == Ad::DELIVERING}.first
          lineitem.li_status = Ad::STATUS[:delivering]
        elsif lineitem.ads.select{|ad| ad.status == Ad::READY}.first
          lineitem.li_status = Ad::STATUS[:draft]
        elsif lineitem.ads.select{|ad| ad.status == Ad::COMPLETED}.count == ads_count
          lineitem.li_status = Ad::STATUS[:completed]
        elsif lineitem.ads.select{|ad| ad.status == Ad::CANCELED}.count == ads_count
          lineitem.li_status = Ad::STATUS[:draft]
        elsif lineitem.ads.select{|ad| ad.status == Ad::PAUSED}.count == ads_count
          lineitem.li_status = Ad::STATUS[:draft]
        elsif lineitem.ads.select{|ad| ad.status == Ad::PAUSED_INVENTORY_RELEASED}.count == ads_count
          lineitem.li_status = Ad::STATUS[:draft]
          # as per Amber's request changed 'Paused Inventory Released' status to 'Paused'
        else
          lineitem.li_status = Ad::STATUS[:draft]
        end
      else
        lineitem.li_status = Ad::STATUS[:draft]
      end
    end
  end


end
