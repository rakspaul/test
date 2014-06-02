class LineitemsController < ApplicationController
  include Authenticator

  add_crumb("Orders") {|instance| instance.send :orders_path}

  respond_to :html, :json

  # GET orders/{order_id}/lineitems
  def index
    @order = Order.includes(:lineitems => [ :geo_targets, :audience_groups, { :creatives => [ :lineitem_assignment, :ad_assignments ] } ]).order('CAST(io_lineitems.alt_ad_id AS INTEGER) ASC, lineitem_assignments.start_date ASC, creatives.size ASC').find(params[:order_id])
    @lineitems = @order.lineitems

    # find ads
    @ads = Ad.where(order_id: @order.id).all

    # if DFP-pulled order
    if @lineitems.empty? && !@ads.empty?
      # adjust order's start/end dates 
      start_date = @ads.min{|m,n| m.start_date <=> n.start_date}.start_date
      end_date   = @ads.max{|m,n| m.end_date <=> n.end_date}.end_date
      @order.user_id = current_user.id if @order.user_id.blank?
      @order.update_attributes({start_date: start_date, end_date: end_date})
      @order.reload

      # create lineitems
      @ads.each do |ad|
        if ad.media_type.blank?
          media_type = current_user.network.media_types.find_by(category: 'Display')
          ad.update_attribute :media_type_id, media_type.id
        else
          media_type = ad.media_type
        end

        li = Lineitem.create name: "DFP Pulled Order", start_date: ad.start_date, end_date: ad.end_date, volume: ad.ad_pricing.try(:quantity), rate: ad.rate, value: ad.ad_pricing.try(:value), order_id: @order.id, ad_sizes: ad.size, user_id: current_user.id, alt_ad_id: ad.alt_ad_id, keyvalue_targeting: ad.keyvalue_targeting, media_type_id: media_type.id, notes: nil, type: media_type.try(:category).to_s, buffer: 10.0, li_status: 'dfp_pulled'

        ad.ad_assignments.each do |assignment|
          LineitemAssignment.create(lineitem: li, creative: assignment.creative, start_date: assignment.start_date, end_date: assignment.end_date, network_id: assignment.network_id, data_source_id: assignment.data_source_id)
        end

        ad.video_ad_assignments.each do |video_assignment|
          LineitemVideoAssignment.create(lineitem: li, video_creative: video_assignment.video_creative, start_date: video_assignment.start_date, end_date: video_assignment.end_date, network_id: video_assignment.network_id, data_source_id: video_assignment.data_source_id)
        end

        if li.errors.blank?
          ad.update_attribute :io_lineitem_id, li.id
          @lineitems << li
        end
      end      
    end
  end

  # GET orders/{order_id}/lineitems/new
  def new
    respond_to do |format|
      format.html { render "orders/index" }
    end
  end

  # GET order/{order_id}/{lineitem_id}
  def show
    respond_to do |format|
      format.html { render "orders/index" }
      format.json do
        @order = Order.find(params[:order_id])
        @lineitem = @order.lineitems.find(params[:id])
      end
    end
  end

  # POST orders/{order_id}/lineitems
  def create
    @order = Order.find(params[:order_id])
    p = params.require(:lineitem).permit(:name, :active, :start_date, :end_date, :value, :volume, :rate, :ad_sizes)
    @lineitem = @order.lineitems.build(p)
    @lineitem.user = current_user

    respond_to do |format|
      if @lineitem.save
        format.json { render json: {status: 'success', li_id: @lineitem.id} }
      else
        format.json { render json: {status: 'error', errors: @lineitem.errors} }
      end
    end
  end

  def update
    @order = Order.find(params[:order_id])
    @lineitem = @order.lineitems.find(params[:id])

    p = params.require(:lineitem).permit(:name, :active, :start_date, :end_date, :volume, :rate, :ad_sizes)

    # Parse date in correct timezone
    p[:start_date] = Time.zone.parse(p[:start_date])
    p[:end_date] = Time.zone.parse(p[:end_date])

    @lineitem.update_attributes(p)

    respond_with(@lineitem)
  end
private

  def set_lineitem_status(lineitems)
    lineitems.each do |lineitem|
      ads_count = lineitem.ads.size
      if  ads_count > 0
        if lineitem.ads.where(:status => Ad::DELIVERING).first
          lineitem.li_status = Ad::STATUS[:delivering]
        elsif lineitem.ads.where(:status => Ad::READY).first
          lineitem.li_status = Ad::STATUS[:ready]
        elsif lineitem.ads.where(:status => Ad::COMPLETED).size == ads_count
          lineitem.li_status = Ad::STATUS[:completed]
        elsif lineitem.ads.where(:status => Ad::CANCELED).size == ads_count
          lineitem.li_status = Ad::STATUS[:canceled]
        elsif lineitem.ads.where(:status => Ad::PAUSED).size == ads_count
          lineitem.li_status = Ad::STATUS[:paused]
        elsif lineitem.ads.where(:status => Ad::PAUSED_INVENTORY_RELEASED).size == ads_count
          lineitem.li_status = Ad::STATUS[:paused]
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
