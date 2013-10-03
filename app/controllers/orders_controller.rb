class OrdersController < ApplicationController
  include Authenticator

  before_filter :set_users_and_orders, :only => [:index, :show, :delete]

  add_crumb("Orders") {|instance| instance.send :orders_path}

  respond_to :html, :json

  def index
  end

  def show
    respond_to do |format|
      format.html
      format.json do
        @order = Order.of_network(current_network).includes(:advertiser).find(params[:id])
      end
    end
  end

  def create
    reach_client = ReachClient.find_by id: params[:order][:reach_client_id]
    errors_list = {}

    if !reach_client
      errors_list['reach_client'] = 'should be specified'
    end

    begin
      trafficking_contact = User.find_by! id: params[:order][:trafficking_contact_id]
    rescue ActiveRecord::RecordNotFound => e
      errors_list['trafficking_contact'] = "this trafficker was not found, please select another one"
    end

    begin
      if reach_client
        bc = find_or_create_billing_contact(params, reach_client)
      end
    rescue ActiveRecord::RecordInvalid => e
      errors_list['billing_contact'] = e.message
    end

    begin
      if reach_client
        mc = find_or_create_media_contact(params, reach_client)
      end
    rescue ActiveRecord::RecordInvalid => e
      errors_list['media_contact'] = e.message
    end

    begin
      sales_person = find_sales_person(params)
    rescue ActiveRecord::RecordInvalid => e
      errors_list['sales_person'] = e.message
    rescue ActiveRecord::RecordNotFound
      errors_list['sales_person'] = "this sales person was not found, please select another one"
    end

    begin
      account_manager = find_account_manager(params)
    rescue ActiveRecord::RecordInvalid => e
      errors_list['account_manager'] = e.message
    rescue ActiveRecord::RecordNotFound
      errors_list['account_manager'] = "this account manager was not found, please select another one"
    end

    p = params.require(:order).permit(:name, :start_date, :end_date)
    @order = Order.new(p)
    @order.network_advertiser_id = params[:order][:advertiser_id].to_i
    @order.sales_person_id = sales_person.id
    @order.network = current_network
    @order.user = current_user

    @order.valid?

    if !errors_list.blank?
      render json: {status: 'error', errors: errors_list.merge(@order.errors)}
      return
    end

    respond_to do |format|
      Order.transaction do
        if @order.save
          IoDetail.create! sales_person_email: params[:order][:sales_person_email], sales_person_phone: params[:order][:sales_person_phone], account_manager_email: params[:order][:account_contact_email], account_manager_phone: params[:order][:account_manager_phone], client_order_id: params[:order][:client_order_id], client_advertiser_name: params[:order][:client_advertiser_name], media_contact: mc, billing_contact: bc, state: "saved", sales_person: sales_person, reach_client: reach_client, order_id: @order.id, account_manager: account_manager, trafficking_contact_id: trafficking_contact.id

          errors = save_lineitems_with_ads(params[:order][:lineitems])

          if errors.blank?
            store_io_asset(params)
            format.json { render json: {status: 'success', order_id: @order.id} }
          else
            format.json { render json: {status: 'error', errors: {lineitems: errors}} }
            raise ActiveRecord::Rollback
          end
        else
          format.json { render json: {status: 'error', errors: @order.errors} }
          raise ActiveRecord::Rollback
        end
      end
    end
  end

  def update
    @order = Order.find(params[:id])
    order_param = params[:order]

    @order.name = order_param[:name]
    @order.start_date = Time.zone.parse(order_param[:start_date])
    @order.end_date = Time.zone.parse(order_param[:end_date])
    @order.network_advertiser_id = order_param[:advertiser_id].to_i
    @order.sales_person_id = order_param[:sales_person_id].to_i

    io_details = @order.io_detail
    io_details.state                  = "saved" if io_details.draft?
    io_details.client_advertiser_name = order_param[:client_advertiser_name]
    io_details.media_contact_id       = order_param[:media_contact_id] if order_param[:media_contact_id]
    io_details.billing_contact_id     = order_param[:billing_contact_id] if order_param[:billing_contact_id]
    io_details.reach_client_id        = order_param[:reach_client_id]
    io_details.trafficking_contact_id = order_param[:trafficking_contact_id]
    #io_details.sales_person_id        = order_param[:sales_person_id]
    #io_details.account_manager_id     = order_param[:account_manager_id]
    io_details.client_order_id        = order_param[:client_order_id]
    io_details.sales_person_email     = order_param[:sales_person_email]
    io_details.sales_person_phone     = order_param[:sales_person_phone]
    io_details.account_manager_email  = order_param[:account_manager_email]
    io_details.account_manager_phone  = order_param[:account_manager_phone]

    respond_to do |format|
      Order.transaction do
        li_ads_errors = update_lineitems_with_ads(order_param[:lineitems])

        if li_ads_errors.blank?
          if @order.save && io_details.save
            format.json { render json: {status: 'success', order_id: @order.id} }
          else
            Rails.logger.warn 'io_details.errors - ' + io_details.errors.inspect
            Rails.logger.warn '@order.errors - ' + @order.errors.inspect
            format.json { render json: {status: 'error', errors: @order.errors} }
            raise ActiveRecord::Rollback
          end
        else
          format.json { render json: {status: 'error', errors: {lineitems: li_ads_errors}} }
          raise ActiveRecord::Rollback
        end
      end
    end
  end

  def search
    search_query = params[:search]
    @orders = Order.of_network(current_network).includes(:sales_person).includes(:user).limit(50)

    if search_query.present?
      @orders = SearchOrdersQuery.new(@orders).search(search_query)
    else
      @orders = @orders.latest_updated
    end

    respond_with(@orders)
  end

  def delete
    ids = params[:ids].split(",")
    Order.delete_all(:id => ids)
    IoDetail.delete_all(:order_id => ids)

    render json: {status: 'success'}
  end
  
  def change_status
    order = Order.find(params[:id])
    case params[:status].strip.to_s
    when "submit_to_trafficker"
      order.io_detail.submit_to_trafficker!
    when "submit_to_am"
      order.io_detail.submit_to_am!
    when "draft"
      order.io_detail.revert_to_draft!
    when "pushing"
      order.io_detail.push!
    end

    render json: {status: "success"}
  rescue AASM::InvalidTransition => e
    render json: {status: "error", message: e.message}
  end

private

  def set_users_and_orders
    sort_column = params[:sort_column]? params[:sort_column] : "name"
    sort_direction = params[:sort_direction]? params[:sort_direction] : "asc"
    order_status = params[:order_status]? params[:order_status] : ""
    am = params[:am]? params[:am] : ""
    trafficker = params[:trafficker]? params[:trafficker] : ""
    search_query = params[:search_query].present? ? params[:search_query] : ""
    orders_by_user = params[:orders_by_user]? params[:orders_by_user] : "my_orders"

    if sort_column == "order_name"
      sort_column = "name"
    elsif sort_column == "advertiser"
      sort_column = "io_details.client_advertiser_name"
    end

    if params[:sort_column].blank?
      if !session[:sort_column].blank?
        sort_column = session[:sort_column]
      end

      if !session[:sort_direction].blank?
        sort_direction = session[:sort_direction]
      end

      if !session[:order_status].blank?
        order_status = session[:order_status]
      end

      if !session[:am].blank?
        am = session[:am]
      end

      if !session[:trafficker].blank?
        trafficker = session[:trafficker]
      end

      if !session[:search_query].blank?
        search_query = session[:search_query]
      end

      if !session[:orders_by_user].blank?
        orders_by_user = session[:orders_by_user]
      end
    end

    session[:sort_column] = sort_column
    session[:sort_direction] = sort_direction
    session[:order_status] = order_status
    session[:orders_by_user] = orders_by_user
    session[:am] = am
    session[:trafficker] = trafficker
    session[:search_query] = search_query

    order_array = Order.includes(:advertiser).joins(:io_detail).of_network(current_network)
                  .order(sort_column + " " + sort_direction)
                  .filterByStatus(order_status).filterByAM(am)
                  .filterByTrafficker(trafficker).filterByLoggingUser(current_user, orders_by_user)
                  .filterByIdOrNameOrAdvertiser(search_query)

    @orders = Kaminari.paginate_array(order_array).page(params[:page]).per(50)
    @users = User.of_network(current_network).where("email like ?", "%@collective.com%").order('first_name ASC')
  end

  def find_account_manager(params)
    p = params.require(:order).permit(:account_contact_name, :account_contact_phone)
    am_name = p[:account_contact_name].split(/\s+/)
    User.find_by!(first_name: am_name.first, last_name: am_name.last)
  end

  def find_sales_person(params)
    sp = params.require(:order).permit(:sales_person_name, :sales_person_phone)
    sp_name = sp[:sales_person_name].split(/\s+/)
    User.find_by!(first_name: sp_name.first, last_name: sp_name.last)
  end

  def find_or_create_media_contact(params, reach_client)
    p = params.require(:order).permit(:media_contact_name, :media_contact_email, :media_contact_phone)
    MediaContact.find_or_create_by!(name: p[:media_contact_name], email: p[:media_contact_email], phone: p[:media_contact_phone], reach_client_id: reach_client.id)
  end

  def find_or_create_billing_contact(params, reach_client)
    p = params.require(:order).permit(:billing_contact_name, :billing_contact_phone, :billing_contact_email)
    BillingContact.find_or_create_by!(name: p[:billing_contact_name], email: p[:billing_contact_email], phone: p[:billing_contact_phone], reach_client_id: reach_client.id)
  end

  def store_io_asset params
    file = File.open(params[:order][:io_file_path])
    writer = IOFileWriter.new("file_store/io_imports", file, params[:order][:io_asset_filename], @order)
    writer.write
    file.close
    File.unlink(file.path)
  end

  def update_lineitems_with_ads(params)
    li_errors = {}

    params.each_with_index do |li, i|
      li_targeting = li[:lineitem].delete(:targeting)
      li_creatives = li[:lineitem].delete(:creatives)
      li[:lineitem].delete(:targeted_zipcodes)
      li[:lineitem].delete(:selected_dmas)
      li[:lineitem].delete(:selected_key_values)
      _delete_creatives_ids = li[:lineitem].delete(:_delete_creatives)

      lineitem = @order.lineitems.find(li[:lineitem][:id])
      li[:lineitem].delete(:id)

      if !lineitem.update_attributes(li[:lineitem])
        Rails.logger.warn 'lineitem.errors - ' + lineitem.errors.inspect
        li_errors[i] ||= {}
        li_errors[i][:lineitems] = lineitem.errors
      else
        lineitem.targeted_zipcodes = li_targeting[:targeting][:selected_zip_codes].to_a.map(&:strip).join(',')
        dmas = li_targeting[:targeting][:selected_dmas].to_a.collect{|dma| DesignatedMarketArea.find_by(code: dma[:id])}

        lineitem.designated_market_areas = []
        lineitem.designated_market_areas = dmas.compact if !dmas.blank?

        selected_groups = li_targeting[:targeting][:selected_key_values].to_a.collect do |group_name|
          AudienceGroup.find_by(name: group_name)
        end
        lineitem.audience_groups = selected_groups if !selected_groups.blank?

        lineitem.creatives.delete(*_delete_creatives_ids) if !_delete_creatives_ids.blank?

        if lineitem.save
          lineitem.save_creatives(li_creatives)
          li[:ads].to_a.each_with_index do |ad, j| 
            begin
              ad_targeting = ad[:ad].delete(:targeting)
              ad_creatives = ad[:ad].delete(:creatives)
              ad[:ad].delete(:selected_dmas)
              ad[:ad].delete(:selected_key_values)
              ad[:ad].delete(:targeted_zipcodes)
              delete_creatives_ids = ad[:ad].delete(:_delete_creatives)

              # for this phase, assign ad size from creatives (or self ad_size if creatives are empty)
              ad[:ad][:size] = if !ad_creatives.blank?
                ad_creatives[0][:creative][:ad_size].to_s.strip
              else
                ad[:ad][:size].split(/,/).first.strip
              end

              ad_object = (ad[:ad][:id] && lineitem.ads.find(ad[:ad][:id])) || lineitem.ads.build(ad[:ad])
              ad_object.order_id = @order.id
              ad_object.source_id = @order.source_id

              zipcodes = ad_targeting[:targeting][:selected_zip_codes].to_a.collect do |zipcode|
                Zipcode.find_by(zipcode: zipcode.strip)
              end
              ad_object.zipcodes = zipcodes.compact if !zipcodes.blank?

              dmas = ad_targeting[:targeting][:selected_dmas].to_a.collect{|dma| DesignatedMarketArea.find_by(code: dma[:id])}

              ad_object.designated_market_areas = dmas.compact if !dmas.blank?

              selected_groups = ad_targeting[:targeting][:selected_key_values].to_a.collect do |group_name|
                AudienceGroup.find_by(name: group_name)
              end
              ad_object.audience_groups = selected_groups if !selected_groups.blank?

              ad_object.creatives.delete(*delete_creatives_ids) if !delete_creatives_ids.blank?

              if ad_object.update_attributes(ad[:ad])
                ad_object.save_creatives(ad_creatives)
              else
                Rails.logger.warn 'ad errors: ' + ad_object.errors.inspect
                li_errors[i] ||= {:ads => {}}
                li_errors[i][:ads][j] = ad_object.errors
              end
            rescue => e
              Rails.logger.warn 'e.message - ' + e.message.inspect
              Rails.logger.warn 'e.backtrace - ' + e.backtrace.inspect
              li_errors[i] ||= {:ads => {}}
              li_errors[i][:ads][j] = e.message.match(/PG::Error:\W+ERROR:(.+):/mi).try(:[], 1)
            end
          end
        end
      end
    end

    li_errors
  end

  def save_lineitems_with_ads(params)
    li_errors = {}

    params.to_a.each_with_index do |li, i|
      li_targeting = li[:lineitem].delete(:targeting)
      li_creatives = li[:lineitem].delete(:creatives)
      delete_creatives_ids = li[:lineitem].delete(:_delete_creatives)

      lineitem = @order.lineitems.build(li[:lineitem])
      lineitem.user = current_user
      lineitem.targeted_zipcodes = li_targeting[:targeting][:selected_zip_codes].to_a.map(&:strip).join(',')
      dmas = li_targeting[:targeting][:selected_dmas].to_a.collect{|dma| DesignatedMarketArea.find_by(code: dma[:id])}
      lineitem.designated_market_areas = dmas.compact if !dmas.blank?

      selected_groups = li_targeting[:targeting][:selected_key_values].to_a.collect do |group_name|
        AudienceGroup.find_by(name: group_name)
      end
      lineitem.audience_groups = selected_groups if !selected_groups.blank?

      if lineitem.save
        lineitem.save_creatives(li_creatives)

        li[:ads].to_a.each_with_index do |ad, j|
          begin
            ad_targeting = ad[:ad].delete(:targeting)
            ad_creatives = ad[:ad].delete(:creatives)
            delete_creatives_ids = ad[:ad].delete(:_delete_creatives)

            # for this phase, assign ad size from creatives (or self ad_size if creatives are empty)
            ad[:ad][:size] = if !ad_creatives.blank?
              ad_creatives[0][:creative][:ad_size].try(:strip) 
            else
              ad[:ad][:size].split(/,/).first.strip
            end

            ad_object = lineitem.ads.build(ad[:ad])
            ad_object.order_id = @order.id
            ad_object.source_id = @order.source_id

            zipcodes = ad_targeting[:targeting][:selected_zip_codes].to_a.collect do |zipcode|
              Zipcode.find_by(zipcode: zipcode.strip)
            end
            ad_object.zipcodes = zipcodes.compact if !zipcodes.blank?

            dmas = ad_targeting[:targeting][:selected_dmas].to_a.collect{|dma| DesignatedMarketArea.find_by(code: dma[:id])}
            ad_object.designated_market_areas = dmas.compact if !dmas.blank?

            selected_groups = ad_targeting[:targeting][:selected_key_values].to_a.collect do |group_name|
              AudienceGroup.find_by(name: group_name)
            end
            ad_object.audience_groups = selected_groups if !selected_groups.blank?

            if ad_object.save
              ad_object.save_creatives(ad_creatives)
            else
              Rails.logger.warn 'ad errors: ' + ad_object.errors.inspect
              li_errors[i] ||= {:ads => {}}
              li_errors[i][:ads][j] = ad_object.errors
            end
          rescue => e
            Rails.logger.warn 'e.message - ' + e.message.inspect
            Rails.logger.warn 'e.backtrace - ' + e.backtrace.inspect
            li_errors[i] ||= {:ads => {}}
            li_errors[i][:ads][j] = e.message.match(/PG::Error:\W+ERROR:(.+):/mi).try(:[], 1)
          end
        end
      else
        Rails.logger.warn 'lineitem.errors - ' + lineitem.errors.inspect
        li_errors[i] ||= {}
        li_errors[i][:lineitems] = lineitem.errors
      end
    end

    li_errors
  end

end
