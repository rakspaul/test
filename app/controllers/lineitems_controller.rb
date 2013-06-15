class LineitemsController < ApplicationController
  include Authenticator

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
    @order.lineitems.create!(p)

    render :json => {'status' => 'ok'}
  end
end
