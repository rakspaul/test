class LineitemsController < ApplicationController
  include Authenticator

  add_crumb("Orders") {|instance| instance.send :orders_path}

  respond_to :html, :json

  # GET orders/{order_id}/lineitems
  def index
    @order = Order.includes(:lineitems => [ :geo_targets, :audience_groups, { :creatives => [ :lineitem_assignment, :ad_assignments ] } ]).order('CAST(io_lineitems.alt_ad_id AS INTEGER) ASC, lineitem_assignments.start_date ASC, creatives.size ASC').find(params[:order_id])
    @order = Order.includes(:lineitems => [ { :creatives => [ :lineitem_assignment, :ad_assignments ] } ]).order('CAST(io_lineitems.alt_ad_id AS INTEGER) ASC, lineitem_assignments.start_date ASC, creatives.size ASC').references(:io_lineitems, :lineitem_assignments, :creatives).find(params[:order_id])
    @lineitems = set_lineitem_status(@order.lineitems)
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
