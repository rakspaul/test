class Buying::OrdersController < ApplicationController
  include Authenticator

  add_crumb("Orders") {|instance| instance.send :buying_orders_path}

  def index
    @orders = Order.of_network(current_network).includes(:advertiser).order("id desc").limit(10)
  end
end
