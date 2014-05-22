class LineitemsController < ApplicationController
  include Authenticator

  add_crumb("Orders") {|instance| instance.send :orders_path}

  respond_to :html, :json

  # GET orders/{order_id}/lineitems
  def index
    @order = Order.includes(:lineitems => [ :designated_market_areas, :audience_groups, { :creatives => [ :lineitem_assignment, :ad_assignments ] } ]).order('CAST(io_lineitems.alt_ad_id AS INTEGER) ASC, lineitem_assignments.start_date ASC, creatives.size ASC').find(params[:order_id])
    @lineitems = @order.lineitems

    # find ads
    @ads = Ad.where(order_id: @order.id).all

    # if DFP-pulled order
    if @lineitems.empty? && !@ads.empty?
      # create lineitems
      @ads.each do |ad|
        li = Lineitem.create name: "Test", start_date: ad.start_date, end_date: ad.end_date, volume: ad.ad_pricing.try(:quantity), rate: ad.rate, value: ad.ad_pricing.try(:value), order_id: @order.id, ad_sizes: ad.size, user_id: current_user.id, alt_ad_id: ad.alt_ad_id, keyvalue_targeting: ad.keyvalue_targeting, media_type_id: ad.media_type_id, notes: nil, type: ad.media_type.try(:category), buffer: 10.0
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
end
