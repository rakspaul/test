class OrdersController < ApplicationController
  include Authenticator

  before_filter :require_client_type_network_or_agency
  before_filter :set_users_and_orders, :only => [:index, :show, :delete]
  before_filter :get_network_media_types, :only => [ :create, :update ]
  before_filter :set_current_user

  add_crumb("Orders") {|instance| instance.send :orders_path}

  respond_to :html, :json

  def index
  end

  def show
    @order = Order.of_network(current_network).includes(:advertiser).find(params[:id])
    @notes = @order.order_notes.joins(:user).order("created_at desc")

    @pushing_errors = @order.io_detail.state =~ /failure|incomplete_push/i ? @order.io_logs.order("created_at DESC").limit(1) : []

    @billing_contacts = BillingContact.for_user(@order.io_detail.reach_client.id).order(:name).all
    @media_contacts   = MediaContact.for_user(@order.io_detail.reach_client.id).order(:name).all
    @reachui_users = load_users.limit(50)

    respond_to do |format|
      format.html
      format.json
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
    @order.sales_person_id = sales_person.id if sales_person
    @order.network = current_network
    @order.user = current_user

    order_notes = params[:order][:notes]
    order_status = params[:order][:order_status]
    if order_status == 'pushing'
      order_notes << {note: "Pushed Order", created_at: Time.current.to_s(:db) , username: current_user }
    end

    respond_to do |format|
      Order.transaction do
        advertiser = create_advertiser(params[:order][:advertiser_name])
        @order.network_advertiser_id = advertiser.id

        order_valid = @order.valid?
        if errors_list.blank? && order_valid && @order.save
          @io_detail = IoDetail.create! sales_person_email: params[:order][:sales_person_email], sales_person_phone: params[:order][:sales_person_phone], account_manager_email: params[:order][:account_contact_email], account_manager_phone: params[:order][:account_manager_phone], client_order_id: params[:order][:client_order_id], client_advertiser_name: params[:order][:client_advertiser_name], media_contact: mc, billing_contact: bc, sales_person: sales_person, reach_client: reach_client, order_id: @order.id, account_manager: account_manager, trafficking_contact_id: trafficking_contact.id, state: (params[:order][:order_status] || "draft")

          order_notes.to_a.each do |note|
            OrderNote.create note: note[:note], user: current_user, order: @order
          end

          errors = save_lineitems_with_ads(params[:order][:lineitems])

          if errors.blank?
            store_io_asset(params)

            format.json { render json: {status: 'success', order_id: @order.id, order_status: IoDetail::STATUS[@io_detail.state.to_s.downcase.to_sym] } }
          else
            format.json { render json: {status: 'error', errors: errors_list.merge({lineitems: errors})} }
            raise ActiveRecord::Rollback
          end
        else
          li_errors = save_lineitems_with_ads(params[:order][:lineitems], false)
          format.json { render json: {status: 'error', errors: errors_list.merge(@order.errors.to_hash.merge({lineitems: li_errors}))} }
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

    io_details.client_advertiser_name = order_param[:client_advertiser_name]
    io_details.media_contact_id       = order_param[:media_contact_id] if order_param[:media_contact_id]
    io_details.billing_contact_id     = order_param[:billing_contact_id] if order_param[:billing_contact_id]
    io_details.reach_client_id        = order_param[:reach_client_id]
    io_details.trafficking_contact_id = order_param[:trafficking_contact_id]
    io_details.client_order_id        = order_param[:client_order_id]
    io_details.sales_person_id        = order_param[:sales_person_id]
    io_details.sales_person_email     = order_param[:sales_person_email]
    io_details.sales_person_phone     = order_param[:sales_person_phone]
    io_details.account_manager_email  = order_param[:account_manager_email]
    io_details.account_manager_phone  = order_param[:account_manager_phone]
    io_details.account_manager_id     = order_param[:account_contact_id]
    io_details.state                  = order_param[:order_status] || "draft"
    io_details.account_manager_id     = order_param[:account_contact_id]
    io_details.sales_person_id        = order_param[:sales_person_id]

    if order_param[:order_status] == "ready_for_trafficker"
      @order.user_id = io_details.trafficking_contact_id
    elsif order_param[:order_status] == "ready_for_am"
      @order.user_id = io_details.account_manager_id
    end

    respond_to do |format|
      Order.transaction do
        li_ads_errors = update_lineitems_with_ads(order_param[:lineitems])

        params[:order][:notes].to_a.each do |note|
          OrderNote.create(note: note[:note], user: current_user, order: @order) if note[:id].blank?
        end

        if li_ads_errors.blank?
          if io_details.save && @order.save
            io_details.reload
            @order.reload

            io_asset = store_io_asset(params)

            state = IoDetail::STATUS[io_details.try(:state).to_s.to_sym]
            format.json { render json: {status: 'success', order_id: @order.id, order_status: state, revised_io_asset_id: io_asset.try(:id)} }
          else
            Rails.logger.warn 'io_details.errors - ' + io_details.errors.inspect
            Rails.logger.warn '@order.errors - ' + @order.errors.inspect
            format.json { render json: {status: 'error', errors: @order.errors} }
            raise ActiveRecord::Rollback
          end
        else
          @order.valid?
          format.json { render json: {status: 'error', errors: {lineitems: li_ads_errors}.reverse_merge!(@order.errors)} }
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
    params[:ids].split(',').each do |id|
      order = Order.find(id)
      order.destroy if order && order.io_detail && order.source_id.to_i.zero?

      orders_by_adv = Order.where(:network_advertiser_id => order.network_advertiser_id)
      adv = Advertiser.find(order.network_advertiser_id)
      adv.destroy if orders_by_adv.length == 0 && adv.source_id.to_i.zero?
    end

    render json: {status: 'success'}
  end

  def status
    order = Order.find(params[:id])
    render json: {status: IoDetail::STATUS[order.io_detail.try(:state).to_sym]}
  end

private

  def set_users_and_orders
    sort_column = params[:sort_column]? params[:sort_column] : "id"
    sort_direction = params[:sort_direction]? params[:sort_direction] : "desc"
    order_status = params[:order_status]? params[:order_status] : ""
    am = params[:am]? params[:am] : ""
    trafficker = params[:trafficker]? params[:trafficker] : ""
    search_query = params[:search_query].present? ? params[:search_query] : ""
    orders_by_user = params[:orders_by_user]? params[:orders_by_user] : is_agency_user? ? "all_orders" : "my_orders"
    rc = params[:rc]? params[:rc] : ""

    if sort_column == "order_name"
      sort_column = "name"
    elsif sort_column == "advertiser"
      sort_column = "io_details.client_advertiser_name"
    end

    if !sort_column && !session[:sort_column].blank?
      sort_column = session[:sort_column]
    end

    if !sort_direction && !session[:sort_direction].blank?
        sort_direction = session[:sort_direction]
    end

    if !order_status && !session[:order_status].blank?
      order_status = session[:order_status]
    end

    if !am && !session[:am].blank?
      am = session[:am]
    end

    if !trafficker && !session[:trafficker].blank?
      trafficker = session[:trafficker]
    end

    if !search_query && !session[:search_query].blank?
      search_query = session[:search_query]
    end

    if !orders_by_user && !session[:orders_by_user].blank?
      orders_by_user = is_agency_user? ? "all_orders" : session[:orders_by_user]
    end

    if !rc && !session[:rc].blank?
      rc = session[:rc]
    end

    session[:sort_column] = sort_column
    session[:sort_direction] = sort_direction
    session[:order_status] = order_status
    session[:orders_by_user] = orders_by_user
    session[:am] = am
    session[:trafficker] = trafficker
    session[:search_query] = search_query
    session[:rc] = rc

    order_array = Order.includes(:advertiser, :order_notes ).joins(:io_detail => :reach_client).of_network(current_network)
                  .order("#{sort_column} #{sort_direction}")
                  .filterByStatus(order_status).filterByAM(am)
                  .filterByTrafficker(trafficker).my_orders(current_user, orders_by_user)
                  .for_agency(current_user.try(:agency), current_user.agency_user?)
                  .filterByIdOrNameOrAdvertiser(search_query)
                  .filterByReachClient(rc)

    @orders = Kaminari.paginate_array(order_array).page(params[:page]).per(50)
    @users = load_users
    @rc = ReachClient.of_network(current_network).select(:name).distinct.order("name asc")
    @agency_user = is_agency_user?
  end

  def load_users
    User.of_network(current_network).joins(:roles)
    .where(roles: { name: Role::REACH_UI}, client_type: User::CLIENT_TYPE_NETWORK)
    .order("first_name, last_name")
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
    mc = MediaContact.find_by(name: p[:media_contact_name], email: p[:media_contact_email])
    if mc
      mc.update_attributes(phone: p[:media_contact_phone], reach_client_id: reach_client.id)
    else
      mc = MediaContact.create!(name: p[:media_contact_name], email: p[:media_contact_email], phone: p[:media_contact_phone], reach_client_id: reach_client.id)
    end
    mc
  end

  def find_or_create_billing_contact(params, reach_client)
    p = params.require(:order).permit(:billing_contact_name, :billing_contact_phone, :billing_contact_email)
    bc = BillingContact.find_by(name: p[:billing_contact_name], email: p[:billing_contact_email])
    if bc
      bc.update_attributes(phone: p[:billing_contact_phone], reach_client_id: reach_client.id)
    else
      bc = BillingContact.create!(name: p[:billing_contact_name], email: p[:billing_contact_email], phone: p[:billing_contact_phone], reach_client_id: reach_client.id)
    end
    bc
  end

  def store_io_asset params
    return if !File.exists?(params[:order][:io_file_path])

    file = File.open(params[:order][:io_file_path])

    if params[:order][:revised_io_filename]
      io_filename = params[:order][:revised_io_filename]
      io_type = 'io_revised'
    else
      io_filename = params[:order][:io_asset_filename]
      io_type = 'io'
    end

    writer = IOFileWriter.new("file_store/io_imports", file, io_filename, @order, io_type)
    io_asset = writer.write
    file.close
    File.unlink(file.path)
    io_asset
  end

  def update_lineitems_with_ads(params)
    li_errors = {}
    ads = []

    params.each_with_index do |li, i|
      sum_of_ad_impressions = 0

      li_targeting = li[:lineitem].delete(:targeting)
      li_creatives = li[:lineitem].delete(:creatives)

      [ :selected_geos, :itemIndex, :selected_key_values, :revised,
      :revised_start_date, :revised_end_date, :revised_name, :revised_volume, :revised_rate].each do |param|
        li[:lineitem].delete(param)
      end

      _delete_creatives_ids = li[:lineitem].delete(:_delete_creatives)

      [ :selected_geos, :itemIndex, :selected_key_values, :revised,
      :revised_start_date, :revised_end_date, :revised_name, :revised_volume, :revised_rate, :li_status].each do |param|
        li[:lineitem].delete(param)
      end

      if li[:type] = 'Video'
        li[:lineitem].delete(:master_ad_size)
        li[:lineitem].delete(:companion_ad_size)
      end

      lineitem = nil
      begin
        lineitem = @order.lineitems.find(li[:lineitem][:id])
        li[:lineitem].delete(:id)
      rescue ActiveRecord::RecordNotFound
        lineitem = @order.lineitems.build(li[:lineitem])
        lineitem.user = current_user
      end

      # delete Ads functionality
      delete_ads = lineitem.ads.map(&:id)
      li[:ads].to_a.each do |ad|
        delete_ads.delete(ad[:ad][:id]) if ad[:ad][:id]
      end

      if !delete_ads.empty?
        Ad.find(delete_ads).each do |ad_to_delete|
          ad_to_delete.destroy if !ad_to_delete.pushed_to_dfp?
        end
      end

      li_update = if lineitem.persisted?
        lineitem.update_attributes(li[:lineitem])
      else
        lineitem.save
      end

      unless li_update
        li_errors[i] ||= {}
        li_errors[i][:lineitems] ||= {}
        li_errors[i][:lineitems].merge!(lineitem.errors)
      end

      lineitem.create_geo_targeting(li_targeting[:targeting])

      lineitem.audience_groups = li_targeting[:targeting][:selected_key_values].to_a.collect do |group_name|
        AudienceGroup.find_by(id: group_name[:id])
      end

      custom_kv_errors = validate_custom_keyvalues(li_targeting[:targeting][:keyvalue_targeting])
      if !custom_kv_errors
        lineitem.keyvalue_targeting = li_targeting[:targeting][:keyvalue_targeting]
      else
        li_errors[i] ||= {}
        li_errors[i][:targeting] = custom_kv_errors
      end

      li_saved = nil

      if li_update
        # delete lineitem_assignments for selected creatives and if there are no ads associated
        # with this creative delete the creative itself
        if !_delete_creatives_ids.blank?
          _delete_creatives_ids.each do |delete_creative_id|
            creative = Creative.find delete_creative_id
            lineitem.lineitem_assignments.find_by(creative_id: creative.id).try(:destroy)
            creative.destroy if creative.ads.empty?
            li_creatives.delete_if { |c| c[:creative][:id] == delete_creative_id } if li_creatives
          end
        end

        li_saved = lineitem.save

        if li_saved
          creatives_errors = lineitem.save_creatives(li_creatives)
          if !creatives_errors.empty?
            li_errors[i] ||= {}
            li_errors[i][:creatives] = creatives_errors
          end
        end
      end

      li[:ads].to_a.each_with_index do |ad, j|
        begin
          ad_targeting = ad[:ad].delete(:targeting)
          ad_creatives = ad[:ad].delete(:creatives)
          ad_quantity  = ad[:ad].delete(:volume)
          ad_quantity  = ad_quantity.gsub(/,/, '').to_f.round if ad_quantity.is_a?(String)
          ad_value     = ad[:ad].delete(:value)
          media_type   = ad[:ad].delete(:type)
          ad_start_date = ad[:ad].delete(:start_date)
          ad_end_date = ad[:ad].delete(:end_date)
          media_type_id = @media_types[media_type]
          ad[:ad][:media_type_id] = media_type_id
          [ :selected_geos, :selected_key_values, :io_lineitem_id, :dfp_url, :dfp_key_values, :keyvalue_targeting, :status].each{ |v| ad[:ad].delete(v) }

          delete_creatives_ids = ad[:ad].delete(:_delete_creatives)

          # for this phase, assign ad size from creatives (or self ad_size if creatives are empty)
          ad[:ad][:size] = if !ad_creatives.blank?
            ad_creatives[0][:creative][:ad_size].to_s.strip
          else
            ad[:ad][:size].split(/,/).first.strip
          end

          if 0 == ad_quantity.to_i
            li_errors[i] ||= {:ads => {}}
            li_errors[i]
            li_errors[i][:ads][j] ||= {}
            li_errors[i][:ads][j][:volume] = "Impressions must be greater than 0."
          end

          ad_object = ad[:ad][:id] && lineitem.ads.find(ad[:ad][:id])

          unless ad_object
            ad_object = lineitem.ads.build(ad[:ad])
            ad[:ad].delete(:frequency_caps_attributes)
          end

          ad_object.description = ad[:ad][:description]
          ad_object.order_id = @order.id
          ad_object.ad_type  = [ 'Facebook', 'Mobile' ].include?(media_type) ? 'SPONSORSHIP' : 'STANDARD'
          ad_object.network = current_network
          ad_object.cost_type = "CPM"
          ad_object.alt_ad_id = lineitem.alt_ad_id
          ad_object.start_date = ad_start_date
          ad_object.end_date = ad_end_date

          if li_saved
            if !delete_creatives_ids.blank?
              ad_object.creatives.find(delete_creatives_ids).each do |creative|
                ad_assignment = ad_object.ad_assignments.detect{|a| a.creative_id == creative.id}
                ad_assignment.destroy if !creative.pushed_to_dfp?
              end
            end
          end

          unique_description_error = nil
          if ads.any?{|ad| ad.description == ad_object.description}
            unique_description_error = { description: 'Ad name is not unique'}
          end
          ads << ad_object

          if ad_object.valid? && li_errors[i].try(:[], :ads).try(:[], j).blank?
            ad_object.save && ad_object.update_attributes(ad[:ad])
            ad_object.save_targeting(ad_targeting)

            custom_kv_errors = validate_custom_keyvalues(ad_targeting[:targeting][:keyvalue_targeting])

            ad_object.update_attribute(:reach_custom_kv_targeting, ad_targeting[:targeting][:keyvalue_targeting]) if !custom_kv_errors
            ad_pricing = (ad_object.ad_pricing || AdPricing.new(ad: ad_object, pricing_type: "CPM", network: current_network))

            ad_pricing.rate = ad[:ad][:rate]
            ad_pricing.quantity = ad_quantity
            ad_pricing.value = ad_value

            if !ad_pricing.save
              li_errors[i] ||= {:ads => {}}
              li_errors[i][:ads][j] = ad_pricing.errors
            end

            creatives_errors = ad_object.save_creatives(ad_creatives)
            if !creatives_errors.blank? || custom_kv_errors
              li_errors[i] ||= {}
              li_errors[i][:ads] ||= {}
              li_errors[i][:ads][j] ||= {}
              li_errors[i][:ads][j][:creatives] = creatives_errors.to_hash if !creatives_errors.blank?
              li_errors[i][:ads][j][:targeting] = custom_kv_errors if custom_kv_errors
            else
              ad_object.update_creatives_name
            end
          else
            Rails.logger.warn 'ad errors: ' + ad_object.errors.inspect
            li_errors[i] ||= {}
            li_errors[i][:ads] ||= {}
            li_errors[i][:ads][j] ||= {}
            li_errors[i][:ads][j].merge!(ad_object.errors.to_hash)
            li_errors[i][:ads][j].merge!(unique_description_error) if unique_description_error
          end
        rescue => e
          Rails.logger.warn 'e.message - ' + e.message.inspect
          Rails.logger.warn 'e.backtrace - ' + e.backtrace.inspect
          li_errors[i] ||= {}
          li_errors[i][:ads] ||= {}
          li_errors[i][:ads][j] = e.message.match(/PG::Error:\W+ERROR:(.+):/mi).try(:[], 1)
        end
      end
    end

    li_errors
  end

  def save_lineitems_with_ads(params, valid_order = true)
    li_errors = {}
    ads = []

    params.to_a.each_with_index do |li, i|
      sum_of_ad_impressions = 0

      [:selected_geos, :selected_key_values, :revised].each{|attr_name| li[:lineitem].delete(attr_name) }

      li_targeting = li[:lineitem].delete(:targeting)
      li_creatives = li[:lineitem].delete(:creatives)
      li[:lineitem].delete(:itemIndex)
      delete_creatives_ids = li[:lineitem].delete(:_delete_creatives)

      if li[:type] = 'Video'
        li[:lineitem].delete(:master_ad_size)
        li[:lineitem].delete(:companion_ad_size)
      end

      lineitem = @order.lineitems.build(li[:lineitem])
      lineitem.user = current_user
      lineitem.proposal_li_id = li[:lineitem][:li_id]

      lineitem.create_geo_targeting(li_targeting[:targeting])

      selected_groups = li_targeting[:targeting][:selected_key_values].to_a.collect do |group_name|
        AudienceGroup.find_by(id: group_name[:id])
      end
      lineitem.audience_groups = selected_groups if !selected_groups.blank?

      custom_kv_errors = validate_custom_keyvalues(li_targeting[:targeting][:keyvalue_targeting])
      if !custom_kv_errors
        lineitem.keyvalue_targeting = li_targeting[:targeting][:keyvalue_targeting]
      else
        li_errors[i] ||= {}
        li_errors[i][:targeting] = custom_kv_errors
      end

      valid_li = lineitem.valid?
      li_saved = valid_order && valid_li && lineitem.save

      creatives_errors = []
      if li_saved && li_creatives
        creatives_errors = lineitem.save_creatives(li_creatives)
      elsif li_creatives
        creatives_errors = validate_creatives(li_creatives, lineitem, 'lineitem')
      end

      if !creatives_errors.empty?
        li_errors[i] ||= {}
        li_errors[i][:creatives] = creatives_errors
      end

      unless valid_li
        Rails.logger.warn 'lineitem.errors - ' + lineitem.errors.inspect
        li_errors[i] ||= {}
        li_errors[i][:lineitems] ||= {}
        li_errors[i][:lineitems].merge!(lineitem.errors)
      end

      if (ad_sizes = li["lineitem"]["ad_sizes"].split(',')) && ad_sizes.include?("0x0")
        Rails.logger.warn 'lineitem.errors - ' + lineitem.errors.inspect
        li_errors[i] ||= {}
        li_errors[i][:lineitems] ||= {}
        li_errors[i][:lineitems].merge!({'ad_sizes' => '0x0 is invalid ad size'})
      end

      li[:ads].to_a.each_with_index do |ad, j|
        begin
          [:selected_geos, :selected_key_values, :io_lineitem_id].each{|attr_name| ad[:ad].delete(attr_name) }

          ad_targeting = ad[:ad].delete(:targeting)
          ad_creatives = ad[:ad].delete(:creatives)
          ad_quantity  = ad[:ad].delete(:volume)
          ad_quantity  = ad_quantity.gsub(/,/, '').to_f.round if ad_quantity.is_a?(String)
          ad_value     = ad[:ad].delete(:value)
          media_type   = ad[:ad].delete(:type)
          media_type_id = @media_types[media_type]
          ad[:ad][:media_type_id] = media_type_id
          delete_creatives_ids = ad[:ad].delete(:_delete_creatives)

          # for this phase, assign ad size from creatives (or self ad_size if creatives are empty)
          ad[:ad][:size] = if !ad_creatives.blank?
            ad_creatives[0][:creative][:ad_size].try(:strip)
          else
            ad[:ad][:size].split(/,/).first.strip
          end

          if 0 == ad_quantity.to_i
            li_errors[i] ||= {:ads => {}}
            li_errors[i]
            li_errors[i][:ads][j] ||= {}
            li_errors[i][:ads][j][:volume] = "Impressions must be greater than 0."
          end

          ad_object = lineitem.ads.build(ad[:ad])
          ad_object.order_id = @order.id
          ad_object.cost_type = "CPM"
          ad_object.ad_type   = ([ 'Facebook', 'Mobile' ].include?(media_type) ? 'SPONSORSHIP' : 'STANDARD')
          ad_object.network_id = current_network.id
          ad_object.reach_custom_kv_targeting = ad_targeting[:targeting][:keyvalue_targeting]
          ad_object.alt_ad_id = lineitem.alt_ad_id

          custom_kv_errors = validate_custom_keyvalues(ad_object.reach_custom_kv_targeting)

          unique_description_error = nil
          if ads.any?{|ad| ad.description == ad_object.description}
            unique_description_error = { description: 'Ad name is not unique'}
          end

          ads << ad_object

          ad_creatives_errors = []
          ad_creatives_errors = validate_creatives(li_creatives, ad_object, 'ad') if li_creatives

          if ad_object.valid? && li_saved && !unique_description_error && !custom_kv_errors && ad_creatives_errors.empty?
            ad_object.save

            ad_object.save_targeting(ad_targeting)

            ad_pricing = AdPricing.new ad: ad_object, pricing_type: "CPM", rate: ad[:ad][:rate], quantity: ad_quantity, value: ad_value, network: current_network

            if !ad_pricing.save
              li_errors[i] ||= {:ads => {}}
              li_errors[i][:ads][j] = ad_pricing.errors
            end

            creatives_errors = ad_object.save_creatives(ad_creatives)

            if !creatives_errors.blank?
              li_errors[i] ||= {:ads => {}}
              li_errors[i]
              li_errors[i][:ads][j] ||= {}
              li_errors[i][:ads][j][:creatives] = creatives_errors.to_hash
            else
              ad_object.update_creatives_name
            end
          else
            Rails.logger.warn 'ad errors: ' + ad_object.errors.inspect
            li_errors[i] ||= {}
            li_errors[i][:ads] ||= {}
            li_errors[i][:ads][j] = ad_object.errors.to_hash
            li_errors[i][:ads][j].merge!(ad_pricing.errors.to_hash) if ad_pricing.try(:errors)
            li_errors[i][:ads][j].merge!(unique_description_error) if unique_description_error
            li_errors[i][:ads][j][:targeting] = custom_kv_errors if custom_kv_errors
            li_errors[i][:ads][j][:creatives] = ad_creatives_errors unless ad_creatives_errors.empty?
          end
        rescue => e
          Rails.logger.warn 'e.message - ' + e.message.inspect
          Rails.logger.warn 'e.backtrace - ' + e.backtrace.inspect
          li_errors[i] ||= {:ads => {}}
          li_errors[i][:ads][j] = e.message.match(/PG::Error:\W+ERROR:(.+):/mi).try(:[], 1)
        end
      end
    end

    li_errors
  end

  def validate_creatives(creatives, parent, type)
    creatives_errors = []
    creatives.each_with_index do |creative_params, index|
      creative = creative_params[:creative]
      creative_errors = {}
      if !creative[:start_date].blank? && (creative[:start_date].to_date < parent.start_date.to_date)
        creative_errors[:start_date] = "couldn't be before #{type}'s start date"
      end

      if !creative[:end_date].blank? && (creative[:end_date].to_date > parent.end_date.to_date)
        creative_errors[:end_date] = "couldn't be after #{type}'s end date"
      end

      if !creative[:end_date].blank? && (creative[:end_date].to_date < parent.start_date.to_date)
        creative_errors[:end_date] = "couldn't be before #{type}'s start date"
      end

      if !creative[:start_date].blank? && (creative[:start_date].to_date > parent.end_date.to_date)
        creative_errors[:start_date] = "couldn't be after #{type}'s end date"
      end

      if !creative[:end_date].blank? && (creative[:end_date].to_date < creative[:start_date].to_date)
        creative_errors[:end_date] = "couldn't be before start date"
      end

      creatives_errors[index] = creative_errors unless creative_errors.empty?
    end
    creatives_errors
  end

  def validate_custom_keyvalues(custom_kv)
    errors_in_kv = false

    if !custom_kv.strip.blank?
      custom_kv.split(',').each do |el|
        if ! el.strip.match /^(\w+)=([\w\.]+)$/
          errors_in_kv = "Key value format should be [key]=[value]"
        end
      end

      if custom_kv.strip.match /(\w+)=([\w\.]+)\s*[^,]*\s*(\w+)=([\w\.]+)/
        errors_in_kv = "Key values should be comma separated"
      end
    end

    errors_in_kv
  end

  def create_advertiser(name)
    advertiser = Advertiser
      .of_network(current_network)
      .of_type_advertiser
      .where(Advertiser.arel_table[:name].matches(name)).first

    if advertiser.blank?
      advertiser = Advertiser.new
      advertiser.name = name
      advertiser.network = current_network

      advertiser_type = AdvertiserType.where(:name => AdvertiserType::ADVERTISER_TYPE, :network => current_network)
      advertiser.advertiser_type_id = advertiser_type.first.id
      advertiser.save
    end

    advertiser
  end

  def get_network_media_types
    @media_types = {}
    current_network.media_types.each{|t| @media_types[t.category] = t.id }
    @media_types['Companion'] = @media_types['Display']
  end

  def set_current_user
    Order.current_user = current_user
  end

  def is_agency_user?
    current_user.agency_user? && current_user.has_roles?([Role::REACH_UI])
  end
end
