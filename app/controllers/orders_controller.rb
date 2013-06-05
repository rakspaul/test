class OrdersController < ApplicationController
  include Authenticator

  add_crumb("Orders") {|instance| instance.send :orders_path}

  def index
  end

  def new
  end
end
