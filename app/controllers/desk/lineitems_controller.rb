class Desk::LineitemsController < LineitemsController

  include Desk::CommonHelper

  before_filter :add_default_filter, :only => [:index]

  private

  def set_lineitem_status(lineitems)
    lineitems.each do |lineitem|
      ads_count = lineitem.ads.size
      if  ads_count > 0
        if lineitem.ads.where(:status => Ad::DELIVERING).first
          lineitem.li_status = Ad::STATUS[:delivering]
        elsif lineitem.ads.where(:status => Ad::READY).first
          lineitem.li_status = Ad::STATUS[:draft]
        elsif lineitem.ads.where(:status => Ad::COMPLETED).size == ads_count
          lineitem.li_status = Ad::STATUS[:completed]
        elsif lineitem.ads.where(:status => Ad::CANCELED).size == ads_count
          lineitem.li_status = Ad::STATUS[:draft]
        elsif lineitem.ads.where(:status => Ad::PAUSED).size == ads_count
          lineitem.li_status = Ad::STATUS[:draft]
        elsif lineitem.ads.where(:status => Ad::PAUSED_INVENTORY_RELEASED).size == ads_count
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
