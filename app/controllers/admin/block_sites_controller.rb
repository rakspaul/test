class Admin::BlockSitesController < ApplicationController
  include Authenticator

  layout "admin"
  respond_to :html, :json

  add_crumb("Block Sites") {|instance| instance.send :admin_block_sites_path}

  def index
  end

  def get_blacklisted_advertisers
    @blacklisted_advertisers = BlockedAdvertiser.of_network(current_network).joins(:site).where(user: current_user).order('Sites.name asc').pending_block
    @blacklisted_advertisers = get_blacklisted_advertiser_and_groups_on_site('BlockedAdvertiser', params['site_id']) if params['site_id'].present?
  end

  def get_blacklisted_advertiser_groups
    @blacklisted_advertiser_groups = BlockedAdvertiserGroup.of_network(current_network).joins(:site).where(user: current_user).order('Sites.name asc').pending_block
    @blacklisted_advertiser_groups = get_blacklisted_advertiser_and_groups_on_site('BlockedAdvertiserGroup', params['site_id']) if params['site_id'].present?
  end

  def get_whitelisted_advertiser
    @whitelisted_advertisers = BlockedAdvertiser.of_network(current_network).joins(:site).where(user: current_user).order('Sites.name asc').pending_unblock
    @whitelisted_advertisers = get_whitelisted_advertiser_on_site('BlockedAdvertiser', params['site_id']) if params['site_id'].present?
  end

  def get_whitelisted_advertiser_groups
    @whitelisted_advertiser_groups = BlockedAdvertiserGroup.of_network(current_network).joins(:site).where(user: current_user).order('Sites.name asc').pending_unblock
  end

  def get_blacklisted_advertiser_and_groups_on_site(model, site_ids)
    site_ids = site_ids.split(",").map(&:to_i)
    site_blocks = model.constantize.of_network(current_network).where(site_id: site_ids).block_or_pending_block
    blocked_site_ids = site_blocks.pluck("site_id").uniq
    site_with_no_blocks = site_ids - blocked_site_ids

    return site_blocks + get_sites_with_no_blocks(model, site_with_no_blocks)
  end

  def get_whitelisted_advertiser_on_site(model, site_ids)
    site_ids = site_ids.split(",").map(&:to_i)
    site_blocks = model.constantize.of_network(current_network).where(site_id: site_ids).unblock_or_pending_unblock
    blocked_site_ids = site_blocks.pluck("site_id").uniq
    site_with_no_blocks = site_ids - blocked_site_ids

    return site_blocks + get_sites_with_no_blocks(model, site_with_no_blocks)
  end

  def create
    create_blacklisted_advertisers(ActiveSupport::JSON.decode(params['blacklistedAdvertisers'])) if params['blacklistedAdvertisers'].present?
    create_blacklisted_advertiser_groups(ActiveSupport::JSON.decode(params['blacklistedAdvertiserGroups'])) if params['blacklistedAdvertiserGroups'].present?
    create_whitelisted_advertisers(ActiveSupport::JSON.decode(params['whitelistedAdvertisers'])) if params['whitelistedAdvertisers'].present?
    create_whitelisted_advertiser_groups(ActiveSupport::JSON.decode(params['whitelistedAdvertiserGroups'])) if params['whitelistedAdvertiserGroups'].present?

    render json: {status: 'success'}

    rescue => e
    respond_with(e.message, status: :service_unavailable)
  end

  def create_blacklisted_advertisers(advertisers)
    advertisers_for_default_blocks = []
    # if any block rule is not there for advertiser then apply default block.
    advertisers.each do |advertiser|
      if BlockedAdvertiser.of_network(current_network).for_advertiser(advertiser["advertiser_id"]).block_or_pending_block.length < 1
        advertisers_for_default_blocks.push(advertiser["advertiser_id"])
      end
    end

    advertisers += get_default_site_blocks_for_advertisers(advertisers_for_default_blocks.uniq)

    advertisers.each do |advertiser|
       ba = BlockedAdvertiser.find_or_initialize_by(:advertiser_id => advertiser["advertiser_id"],:site_id => advertiser["site_id"], :network_id => current_network.id)
       ba.state = BlockedAdvertiser::PENDING_BLOCK
       ba.user = current_user
       ba.save
    end
  end

  def create_blacklisted_advertiser_groups(advertiser_groups)
    advertiser_groups.each do |advertiser_group|
      bag = BlockedAdvertiserGroup.find_or_initialize_by(:advertiser_group_id => advertiser_group["advertiser_group_id"], :site_id => advertiser_group["site_id"], :network_id => current_network.id)
      bag.state = BlockedAdvertiserGroup::PENDING_BLOCK
      bag.user = current_user
      bag.save
    end
  end

  def create_whitelisted_advertisers(advertisers)
    advertisers.each do |advertiser|
       ba = BlockedAdvertiser.find_or_initialize_by(:advertiser_id => advertiser["advertiser_id"],:site_id => advertiser["site_id"], :network_id => current_network.id)
       ba.user = current_user
       ba.network = current_network
       ba.state = BlockedAdvertiser::PENDING_UNBLOCK
       ba.save
    end
  end

  def create_whitelisted_advertiser_groups(advertiser_groups)
    advertiser_groups.each do |advertiser_group|
      bag = BlockedAdvertiserGroup.find_or_initialize_by(:advertiser_group_id => advertiser_group["advertiser_group_id"],:site_id => advertiser_group["site_id"], :network_id => current_network.id)
      bag.state = BlockSite::PENDING_UNBLOCK
      bag.user = current_user
      bag.save
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

  def export_blacklisted_advertisers_and_groups
    site_ids = params[:site_ids]

    if !site_ids.nil?
      blocked_sites = BlockSite.of_network(current_network).block_or_pending_block.where(:site_id => site_ids.split(',')).order(:id)
      bs_export = BlockSitesExport.new(blocked_sites, current_user)

      send_data bs_export.export_blacklisted_advertisers_and_groups, :filename => bs_export.get_file, :x_sendfile => true, :type => "application/vnd.ms-excel"
    else
      render json: {status: 'error', message: 'No sites selected to export.'}
    end

  rescue => e
      render json: { errors: e.message }, status: :unprocessable_entity
  end

  def export_whitelisted_advertisers
    site_ids = params[:site_ids]

    if !site_ids.nil?
      blocked_sites = BlockedAdvertiser.of_network(current_network).unblock_or_pending_unblock.where(:site_id => site_ids.split(',')).order(:id)
      bs_export = BlockSitesExport.new(blocked_sites, current_user)

      send_data bs_export.export_whitelisted_advertisers, :filename => bs_export.get_file, :x_sendfile => true, :type => "application/vnd.ms-excel"
    else
      render json: {status: 'error', message: 'No sites selected to export.'}
    end

  rescue => e
      render json: { errors: e.message }, status: :unprocessable_entity
  end

  def advertisers_with_default_blocks
    if params['advertiser_id'].present?
      advertiser_ids = params['advertiser_id'].split(",").map(&:to_i)
      ba = BlockedAdvertiser.of_network(current_network).for_advertiser(advertiser_ids).block_or_pending_block
      advertiser_with_default_blocks = advertiser_ids - ba.pluck("advertiser_id").uniq
      render json: {default_block: advertiser_with_default_blocks}
    end
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

  # this function will take advertisers ids as parameter and will apply default blocks to them.
  def get_default_site_blocks_for_advertisers(advertiser_ids)
    advertiser_with_default_blocks = []
    default_sites = DefaultSiteBlocks.of_network(current_network)

    advertiser_ids.each do |id|
      advertiser = Advertiser.find(id)
      if advertiser
        default_sites.each do |default_site|
          advertiser_whitelisted = BlockedAdvertiser.of_network(current_network).where(:advertiser => advertiser, :site => default_site.site).unblock_or_pending_unblock.first
          if !advertiser_whitelisted
            # default_block => true, will append (Default Block) text next to site name like '123 Greetings (Default Block)'
            ba =  BlockedAdvertiser.new(:advertiser => advertiser, :site => default_site.site, :default_block => true)
            advertiser_with_default_blocks.push(ba)
          end
      end
    end
  end

    return advertiser_with_default_blocks
  end

  def get_sites_with_no_blocks(model, site_ids)
    sites = Site.find(site_ids)
    blocks = []
    sites.each do |site|
      block = model.constantize.new({:site => site});
      blocks.push(block);
    end
    return blocks;
  end

end
