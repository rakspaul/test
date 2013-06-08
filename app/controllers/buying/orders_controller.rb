class Buying::OrdersController < ApplicationController
  include Authenticator

  add_crumb("Orders") {|instance| instance.send :buying_orders_path}

  def index
  end
end
