class KendouiController < ApplicationController
  include Authenticator

  respond_to :html, :json

  add_crumb("Kendo UI Grid") {|instance| instance.send :kendoui_index_path}

  def index
    order_rel = Order.includes("advertiser").of_network(current_network.id)
    @total_count = order_rel.count
    sort_list = []
    if params[:sort].present?
      params[:sort].each do |k, v|
        if v[:field] == "advertiser_name"
          sort_list << "network_advertisers.name #{v[:dir]}"
        else
          sort_list << "#{v[:field]} #{v[:dir]}"
        end
      end
    else
      sort_list << "start_date desc"
    end

    @orders = order_rel.limit(params[:pageSize]).offset(params[:skip]).order(sort_list.join(','))
    respond_with(@orders)
  end

  def new
  end
end
