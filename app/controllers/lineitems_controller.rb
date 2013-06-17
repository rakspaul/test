class LineitemsController < ApplicationController
  include Authenticator

  add_crumb("Orders") {|instance| instance.send :orders_path}

  # GET orders/{order_id}/lineitems
  def index
    @order = Order.find(params[:order_id])
  end

  # GET orders/{order_id}/lineitems/new
  def new
    respond_to do |format|
      format.html { render "orders/index" }
    end
  end

  # GET order/{order_id}/{lineitem_id}
  def show
  end

  # POST orders/{order_id}/lineitems
  def create
    @order = Order.find(params[:order_id])
    p = params.require(:lineitem).permit(:name, :active, :start_date, :end_date, :volume, :rate)
    @lineitem = @order.lineitems.create(p)

    if @lineitem.valid?
      render status: :ok
    else
      render json: { errors: @lineitem.errors }, status: :unprocessable_entity
    end
  end
end
