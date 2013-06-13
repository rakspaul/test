class Reports::OrdersController < ApplicationController
  include Authenticator

  add_crumb("Orders") {|instance| instance.send :reports_orders_path}

  respond_to :html, :js, :json, :csv

  def index
  	@orders = Report::Order.includes("advertiser").of_network(current_network).limit(500)
  	respond_with(@orders)
  end

  def new
  end

end
