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
      id = Integer(search_query) rescue 0
      # assume that number above 4 digit is search on 'id' or 'source id'
      if id > 9999
        @orders = @orders.find_by_id_or_source_id(id)
      else
        @orders = @orders.where(
                    "orders.name ilike :q or
                      network_advertisers.name ilike :q", q: "%#{search_query}%")
                    .references(:advertiser)
      end
    else
      @orders = @orders.latest_updated
    end

    respond_with(@orders)
  end
end
