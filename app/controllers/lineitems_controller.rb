class LineitemsController < ApplicationController
  include Authenticator

  add_crumb("Orders") {|instance| instance.send :orders_path}

  respond_to :html, :json

  # GET orders/{order_id}/lineitems
  def index
    @order = Order.includes(:lineitems => [ :geo_targets, :audience_groups, { :creatives => [ :lineitem_assignment, :ad_assignments ] } ]).order('CAST(io_lineitems.alt_ad_id AS INTEGER) ASC, lineitem_assignments.start_date ASC, creatives.size ASC').find(params[:order_id])
    @lineitems = @order.lineitems

    # find ads
    @ads = Ad.where(order_id: @order.id).load

    # if DFP-pulled order
    if @lineitems.empty? && !@ads.empty?
      # adjust order's start/end dates 
      start_date = @ads.min{|m,n| m.start_date <=> n.start_date}.start_date
      end_date   = @ads.max{|m,n| m.end_date <=> n.end_date}.end_date
      @order.user_id = current_user.id if @order.user_id.blank?
      @order.update_attributes({start_date: start_date, end_date: end_date})
      @order.reload

      # create lineitems
      @ads.group_by(&:alt_ad_id).each do |alt_ad_id, ads|
        ad = ads.first
        if ad.media_type.blank?
          media_type = current_user.network.media_types.find_by(category: 'Display')
          ads.each{|add| add.update_attribute(:media_type_id, media_type.id)}
        else
          media_type = ad.media_type
        end

        # we need the li_status = 'dfp_pulled' to differentiate this LI and bypass
        # validation on start_date attribute (otherwise it will not create LI with start_date in past)
        li = Lineitem.create name: "Contract Line Item #{alt_ad_id}", start_date: ad.start_date, end_date: ad.end_date, volume: ads.sum{|add| add.ad_pricing.try(:quantity).to_i}, rate: ad.rate, value: ads.sum{|add| add.ad_pricing.try(:value).to_f}, order_id: @order.id, ad_sizes: ads.map{|add| add.size}.uniq.join(', '), user_id: current_user.id, alt_ad_id: alt_ad_id, keyvalue_targeting: ad.keyvalue_targeting, media_type_id: media_type.id, notes: nil, type: media_type.try(:category).to_s, buffer: 10.0, li_status: 'dfp_pulled', uploaded: false

        ads.map(&:ad_assignments).flatten.uniq.each do |assignment|
          LineitemAssignment.create(lineitem: li, creative: assignment.creative, start_date: assignment.start_date, end_date: assignment.end_date, network_id: assignment.network_id, data_source_id: assignment.data_source_id)
        end

        ads.map(&:video_ad_assignments).flatten.uniq.each do |video_assignment|
          LineitemVideoAssignment.create(lineitem: li, video_creative: video_assignment.video_creative, start_date: video_assignment.start_date, end_date: video_assignment.end_date, network_id: video_assignment.network_id, data_source_id: video_assignment.data_source_id)
        end

        ads.map(&:ad_geo_targetings).flatten.uniq.each do |agt|
          LineitemGeoTargeting.create(lineitem: li, geo_target: agt.geo_target)
        end

        ads.map(&:frequency_caps).flatten.uniq.each do |fc|
          LineitemFrequencyCap.create(lineitem: li, cap_value: fc.cap_value, time_value: fc.time_value, time_unit: fc.time_unit)
        end

        ads.map(&:audience_groups).flatten.uniq.each{|ag| li.audience_groups << ag}

        if li.errors.blank?
          ads.each{|ad| ad.update_attribute(:io_lineitem_id, li.id)}
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
