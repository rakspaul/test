class OrdersController < ApplicationController
  include Authenticator

  add_crumb("Orders") {|instance| instance.send :orders_path}

  respond_to :html, :json

  def index
  end

  def show
    respond_to do |format|
      format.html { render :index }
      format.json do
        @order = Order.of_network(current_network)
              .includes(:advertiser).find(params[:id])
      end
    end
  end

  def create
    p = params.require(:order).permit(:name, :start_date, :end_date)
    @order = Order.new(p)
    @order.network_advertiser_id = params[:order][:advertiser_id].to_i
    @order.sales_person_id = params[:order][:sales_person_id].to_i
    @order.network = current_network
    @order.user = current_user
    if @order.save
      render status: :ok
    else
      render json: { errors: @order.errors }, status: :unprocessable_entity
    end
  end

  def update
    @order = Order.find(params[:id])
    order_param = params[:order]

    @order.name = params[:order][:name]
    @order.start_date = params[:order][:start_date]
    @order.end_date = params[:order][:end_date]
    @order.network_advertiser_id = params[:order][:advertiser_id].to_i
    @order.sales_person_id = params[:order][:sales_person_id].to_i

    # Legacy orders might not have user's assigned to it. Therefore this user
    # as owner/creator of order
    @order.user = current_user if @order.user.nil?

    if @order.save
      render :create
    else
      render json: { errors: @order.errors }, status: :unprocessable_entity
    end
  end

  def search
    search_query = params[:search]
    @orders = Order.of_network(current_network)
      .includes(:advertiser)
      .includes(:sales_person)
      .includes(:user)
      .limit(50)
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

  def export
    @order = Order.of_network(current_network)
              .includes(:advertiser).find(params[:order_id])

    workbook = SpreadsheetX.open('public/template.xlsx')    
    worksheet = workbook.worksheets[0]
    worksheet.update_cell(3, 19, @order.name)
    worksheet.update_cell(3, 20, @order.source_id)
    worksheet.update_cell(7, 25, @order.start_date.strftime("%m/%d/%Y"))
    worksheet.update_cell(7, 26, @order.end_date.strftime("%m/%d/%Y"))
    worksheet.update_cell(3, 18, @order.advertiser.name)
    
    row_no =29
    @order.lineitems.each do |lineitem|
      worksheet.update_cell(1, row_no, lineitem.start_date.strftime("%m/%d/%Y"))
      worksheet.update_cell(2, row_no, lineitem.end_date.strftime("%m/%d/%Y"))
      worksheet.update_cell(3, row_no, lineitem.ad_sizes)
      worksheet.update_cell(5, row_no,  lineitem.volume.to_i)
      worksheet.update_cell(6, row_no,  lineitem.rate.to_i)
      worksheet.update_cell(7, row_no,  lineitem.value.to_i)

      row_no = row_no + 1
    end

    name = "public/exports/"+@order.name.to_s.gsub( /\W/, '_' ) + ".xlsx"
    workbook.save(name)
    
    send_file name , :x_sendfile => true
  end
end

