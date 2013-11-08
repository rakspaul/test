class Admin::BlockSitesController < ApplicationController
  include Authenticator

  layout "admin"
  respond_to :html, :json

  add_crumb("Block Sites") {|instance| instance.send :admin_block_sites_path}

  def index
    @blocked_sites = site_blocks(params['type'], params['site_id']) if params['type'].present? && params['site_id'].present?
    @blocked_sites = blocked_advertiser_sites(params['type'], params['advertiser_id']) if params['type'].present? && params['advertiser_id'].present?
    @blocked_sites = blocked_advertiser_group_sites(params['type'], params['advertiser_group_id']) if params['type'].present? && params['advertiser_group_id'].present?

    respond_with(@blocked_sites)
  end

  def site_blocks(model, site_ids)
    model.constantize.of_network(current_network).where(site_id: site_ids.split(",")).where(state: [BlockSite::PENDING_BLOCK, BlockSite::BLOCK])
  end

  def blocked_advertiser_sites(model, advertiser_id)
    advertiser_id = advertiser_id.split(",").map(&:to_i)

    blocked_advertiser_sites = model.constantize.of_network(current_network).where(advertiser_id: advertiser_id).where(state: [BlockSite::PENDING_BLOCK, BlockSite::BLOCK])

    advertiser_with_blocks = blocked_advertiser_sites.pluck("advertiser_id").uniq
    #find advertisers who don’t have any block rule (advertisers requested minus advertisers found)
    advertiser_with_no_blocks = advertiser_id - advertiser_with_blocks

    return blocked_advertiser_sites + get_default_site_blocks_for_advertisers(advertiser_with_no_blocks)
  end

  def blocked_advertiser_group_sites(model, advertiser_group_id)
    model.constantize.of_network(current_network).where(advertiser_group_id: advertiser_group_id.split(",")).where(state: [BlockSite::PENDING_BLOCK, BlockSite::BLOCK])
  end

  def create
    block_advertisers(ActiveSupport::JSON.decode(params['blocked_advertisers'])) if params['blocked_advertisers'].present?
    block_advertiser_group(ActiveSupport::JSON.decode(params['blocked_advertiser_groups'])) if params['blocked_advertiser_groups'].present?
    unblock_sites(ActiveSupport::JSON.decode(params['unblocked_sites'])) if params['unblocked_sites'].present?

    render json: {status: 'success'}

    rescue => e
    respond_with(e.message, status: :service_unavailable)
  end

  def block_advertisers(blocked_advertisers)
    advertisers_for_default_blocks = []
    # if any block rule is not there for advertiser then apply default block.
    blocked_advertisers.each do |advertiser|
      if BlockedAdvertiser.where(:advertiser_id => advertiser["advertiser_id"], state: [BlockSite::PENDING_BLOCK, BlockSite::BLOCK], :network_id => current_network.id).length < 1
        advertisers_for_default_blocks.push(advertiser["advertiser_id"])
      end
    end

    blocked_advertisers += get_default_site_blocks_for_advertisers(advertisers_for_default_blocks.uniq)

    blocked_advertisers.each do |advertiser|
       ba = BlockedAdvertiser.find_or_initialize_by(:advertiser_id => advertiser["advertiser_id"],:site_id => advertiser["site_id"], :network_id => current_network.id)
       ba.user = current_user
       ba.network = current_network
       ba.state = BlockedAdvertiser::PENDING_BLOCK
       ba.save
    end
  end

  def block_advertiser_group(blocked_advertiser_groups)
    blocked_advertiser_groups.each do |advertiser_group|
      bag = BlockedAdvertiserGroup.find_or_initialize_by(:advertiser_group_id => advertiser_group["advertiser_group_id"], :site_id => advertiser_group["site_id"], :network_id => current_network.id)
      bag.user = current_user
      bag.network = current_network
      bag.state = BlockedAdvertiserGroup::PENDING_BLOCK
      bag.save
    end
  end

  def unblock_sites(unblocked_sites)
    unblocked_sites.each do |block|
      bs = BlockSite.find(block['id'])
      if bs
        bs.state = BlockSite::PENDING_UNBLOCK
        bs.user = current_user
        bs.save
      end
    end
  end

  def commit
    vos = BlockSite.of_network(current_network).where(state: [BlockSite::PENDING_BLOCK, BlockSite::PENDING_UNBLOCK])

    if vos && vos.size > 0
      enqueue_for_push
      render json: {status: 'success', message: 'Your changes were committed successfully.'}
    else
      render json: {status: 'error', message: 'There are no changes to commit.'}
    end

    rescue => e
    respond_with(e.message, status: :service_unavailable)
  end

  def export_sites
    site_ids = params[:site_ids]

    if !site_ids.nil?
      blocked_sites = BlockSite.of_network(current_network).where(:state => [BlockSite::PENDING_BLOCK, BlockSite::BLOCK], :site_id => site_ids.split(',')).order(:id)
      bs_export = BlockSitesExport.new(blocked_sites, current_user)

      send_data bs_export.export_to_excel, :filename => bs_export.get_sites_file, :x_sendfile => true, :type => "application/vnd.ms-excel"
    else
      render json: {status: 'error', message: 'No sites selected to export.'}
    end

  rescue => e
      render json: { errors: e.message }, status: :unprocessable_entity
  end

  def export_adv_and_group
    blocked_type = params[:type]
    blocked_list = params[:block_list]

    if blocked_type == BlockSite::BLOCKED_ADVERTISER && !blocked_list.nil?
      blocked_adv = BlockSite.of_network(current_network).where(:state => [BlockSite::PENDING_BLOCK, BlockSite::BLOCK], :advertiser_id => blocked_list.split(',')).order(:id)
      adv_export = BlockAdvertiserAndGroupExport.new(current_user)

      send_data adv_export.export_advertiser(blocked_adv), :filename => adv_export.get_adv_file, :x_sendfile => true, :type => "application/vnd.ms-excel"

    elsif blocked_type == BlockSite::BLOCKED_ADVERTISER_GROUP && !blocked_list.nil?
      blocked_adv_grp = BlockSite.of_network(current_network).where(:state => [BlockSite::PENDING_BLOCK, BlockSite::BLOCK], :advertiser_group_id => blocked_list.split(',')).order(:id)
      adv_grp_export = BlockAdvertiserAndGroupExport.new(current_user)

      send_data adv_grp_export.export_advertiser_group(blocked_adv_grp), :filename => adv_grp_export.get_adv_group_file, :x_sendfile => true, :type => "application/vnd.ms-excel"

    else
      render json: {status: 'error', message: 'No advertisers and groups selected to export.'}
    end

  rescue => e
     render json: { errors: e.message }, status: :unprocessable_entity
  end

private

  def enqueue_for_push
    queue_name = "reach.sites.block"
    rmq = RabbitMQWrapper.new :queue => queue_name 

    Rails.logger.warn "Block Site: Commit started by User: #{current_user.account_login} (Name: #{current_user.full_name}, Email: #{current_user.email}) of Network: #{current_network.name} at #{Time.now}"
    msg = current_user.id.to_s

    rmq.publish(msg)
    rmq.close
  rescue => e
    Rails.logger.warn "Block Site error: #{e.message.inspect}"
  end

  def get_sites_file
    "#{current_user.network.name}_Block_Sites_#{Date.today.strftime('%Y-%m-%d')}.xls"
  end

  def get_adv_file
    "#{current_user.network.name}_Block_Advertisers_#{Date.today.strftime('%Y-%m-%d')}.xls"
  end

  def get_adv_group_file
    "#{current_user.network.name}_Block_Advertisers_group_#{Date.today.strftime('%Y-%m-%d')}.xls"
  end

  # this function will take advertisers ids as parameter and will apply default blocks to them.
  def get_default_site_blocks_for_advertisers(advertiser_ids)
    advertiser_with_default_blocks = []
    default_sites = DefaultSiteBlocks.of_network(current_network)

    advertiser_ids.each do |id|
      advertiser = Advertiser.find(id)
      if advertiser
        default_sites.each do |site|
          # default_block = true, will append (Default Block) text next to site name like '123 Greetings (Default Block)'
          ba =  BlockedAdvertiser.new(:advertiser => advertiser, :site => site.site, :default_block => true)
          advertiser_with_default_blocks.push(ba)
        end
      end
    end

    return advertiser_with_default_blocks
  end

end
