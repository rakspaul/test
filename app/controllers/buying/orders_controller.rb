class Buying::OrdersController < ApplicationController
  include Authenticator

  add_crumb("Orders") {|instance| instance.send :buying_orders_path}

  respond_to :html, :json

  def index
  end

  def search
    search_query = params[:search]
    @orders = Order.of_network(current_network).includes(:advertiser).limit(50)
    if search_query.present?
      @orders = @orders.where("orders.name ilike :q or network_advertisers.name ilike :q", q: "%#{search_query}%")
                  .references(:advertiser)
    else
      @orders = @orders.order("last_modified desc")
    end

    respond_with(@orders)
  end
end
