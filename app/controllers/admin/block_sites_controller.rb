class Admin::BlockSitesController < ApplicationController
  include Authenticator

  layout "admin"
  respond_to :html, :json

  before_filter :require_client_type_network

  add_crumb("Block Sites") {|instance| instance.send :admin_block_sites_path}

  def index
  end

  def get_blacklisted_advertisers
    @blacklisted_advertisers = get_blacklisted_advertiser_and_groups_on_site('BlockedAdvertiser', params['site_id']) if params['site_id'].present?
  end

  def get_blacklisted_advertiser_groups
    @blacklisted_advertiser_groups = get_blacklisted_advertiser_and_groups_on_site('BlockedAdvertiserGroup', params['site_id']) if params['site_id'].present?
  end

  def get_whitelisted_advertiser
    @whitelisted_advertisers = get_whitelisted_advertiser_on_site('BlockedAdvertiser', params['site_id']) if params['site_id'].present?
  end

  def get_blacklisted_advertiser_and_groups_on_site(model, site_ids)
    site_ids = site_ids.split(",").map(&:to_i)
    site_blocks = model.constantize.of_network(current_network).where(site_id: site_ids).block_or_pending_block_or_pending_unblock
    blocked_site_ids = site_blocks.pluck("site_id").uniq
    site_with_no_blocks = site_ids - blocked_site_ids

    return site_blocks + get_sites_with_no_blocks(model, site_with_no_blocks)
  end

  def get_whitelisted_advertiser_on_site(model, site_ids)
    site_ids = site_ids.split(",").map(&:to_i)
    site_blocks = model.constantize.of_network(current_network).where(site_id: site_ids).unblock_or_pending_unblock_pending_block
    blocked_site_ids = site_blocks.pluck("site_id").uniq
    site_with_no_blocks = site_ids - blocked_site_ids

    return site_blocks + get_sites_with_no_blocks(model, site_with_no_blocks)
  end

  def create
    create_blacklisted_advertisers(ActiveSupport::JSON.decode(params['blacklistedAdvertisers'])) if params['blacklistedAdvertisers'].present?
    create_whitelisted_advertisers(ActiveSupport::JSON.decode(params['whitelistedAdvertisers'])) if params['whitelistedAdvertisers'].present?

    block_advertisers(ActiveSupport::JSON.decode(params['blockedAdvertisers'])) if params['blockedAdvertisers'].present?
    unblock_advertisers(ActiveSupport::JSON.decode(params['unblockAdvertisers'])) if params['unblockAdvertisers'].present?

    delete_blacklisted_advertisers(ActiveSupport::JSON.decode(params['deletedBlacklistedAdvertisers'])) if params['deletedBlacklistedAdvertisers'].present?
    delete_whitelisted_advertisers(ActiveSupport::JSON.decode(params['deletedWhitelistedAdvertisers'])) if params['deletedWhitelistedAdvertisers'].present?

    create_blacklisted_advertiser_groups(ActiveSupport::JSON.decode(params['blacklistedAdvertiserGroups'])) if params['blacklistedAdvertiserGroups'].present?
    create_whitelisted_advertiser_groups(ActiveSupport::JSON.decode(params['whitelistedAdvertiserGroups'])) if params['whitelistedAdvertiserGroups'].present?

    block_advertiser_group(ActiveSupport::JSON.decode(params['blockedAdvertiserGroups'])) if params['blockedAdvertiserGroups'].present?
    delete_advertiser_group(ActiveSupport::JSON.decode(params['deletedAdvertiserGroups'])) if params['deletedAdvertiserGroups'].present?

    render json: {status: 'success'}

    rescue => e
    respond_with(e.message, status: :service_unavailable)
  end

  def create_blacklisted_advertisers(advertisers)
    advertisers_for_default_blocks = []
    # if any block rule is not there for advertiser then apply default block.

    advertiser_ids = []
    advertisers.each do |advertiser|
      advertiser_ids.push(advertiser["advertiser_id"])
    end

    # find any advertiser is blocked on any site or not
    blocked_advertiser_ids = BlockedAdvertiser.of_network(current_network).for_advertiser(advertiser_ids).block_or_pending_block.pluck("advertiser_id").uniq
    # remove already blocked advertisers
    advertisers_for_default_blocks = advertiser_ids - blocked_advertiser_ids
    # get default blocks for advertisers not blocked on any site
    advertisers += get_default_site_blocks_for_advertisers(advertisers_for_default_blocks.uniq)

    create_or_update_advertisers(advertisers, BlockedAdvertiser::PENDING_BLOCK)
  end

  def create_blacklisted_advertiser_groups(advertiser_groups)
    create_or_update_advertiser_groups(advertiser_groups, BlockedAdvertiserGroup::PENDING_BLOCK)
  end

  def create_whitelisted_advertisers(advertisers)
    create_or_update_advertisers(advertisers, BlockedAdvertiser::PENDING_UNBLOCK)
  end

  def create_whitelisted_advertiser_groups(advertiser_groups)
    create_or_update_advertiser_groups(advertiser_groups, BlockedAdvertiserGroup::PENDING_UNBLOCK)
  end

  def block_advertisers(advertisers)
    create_or_update_advertisers(advertisers, BlockedAdvertiser::BLOCK)
  end

  def unblock_advertisers(advertisers)
    advertisers.each do |advertiser|
      create_or_update_advertiser(advertiser["advertiser_id"], advertiser["site_id"], BlockedAdvertiser::UNBLOCK)
      default_sites = DefaultSiteBlocks.of_network(current_network).where.not(:site_id => advertiser["site_id"])
      if BlockedAdvertiser.of_network(current_network).where(:advertiser_id => advertiser["advertiser_id"]).where.not(:site_id => default_sites.pluck("site_id")).block_or_pending_block.length < 1
        delete_default_blocks(advertiser["advertiser_id"], advertiser["site_id"])
      end
    end
  end

  def delete_blacklisted_advertisers(advertisers)
    default_sites = DefaultSiteBlocks.of_network(current_network)

    advertisers.each do |advertiser|
      ba = BlockedAdvertiser.find_or_initialize_by(:advertiser_id => advertiser["advertiser_id"],:site_id => advertiser["site_id"], :network_id => current_network.id)
      if ba
        ba.delete
        if BlockedAdvertiser.of_network(current_network).where(:advertiser_id => advertiser["advertiser_id"]).where.not(:site_id => default_sites.pluck("site_id")).block_or_pending_block.length < 1
          delete_default_blocks(advertiser["advertiser_id"])
         end
      end
    end
  end

  def delete_whitelisted_advertisers(advertisers)
    advertisers.each do |advertiser|
       ba = BlockedAdvertiser.find_or_initialize_by(:advertiser_id => advertiser["advertiser_id"],:site_id => advertiser["site_id"], :network_id => current_network.id)
        ba.delete if ba
    end
  end

  def block_advertiser_group(advertiser_groups)
    create_or_update_advertiser_groups(advertiser_groups, BlockedAdvertiserGroup::BLOCK)
  end

  def delete_advertiser_group(advertiser_groups)
    advertiser_groups.each do |advertiser_group|
      bag = BlockedAdvertiserGroup.find_or_initialize_by(:advertiser_group_id => advertiser_group["advertiser_group_id"], :site_id => advertiser_group["site_id"], :network_id => current_network.id)
      bag.delete if bag
    end
  end

  def commit
    vos = BlockSite.of_network(current_network).where(state: [BlockSite::PENDING_BLOCK, BlockSite::PENDING_UNBLOCK])

    if vos && vos.size > 0
      update_commit_status
      enqueue_for_push
      render json: {status: 'success', message: 'Your changes are being processed.'}
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

  def blacklisted_advertisers_to_commit
    @fullcount = BlockedAdvertiser.of_network(current_network).joins(:site, :advertiser).where(user: current_user).order('sites.name asc, network_advertisers.name asc').pending_block.count
    @blacklisted_advertisers = BlockedAdvertiser.of_network(current_network).joins(:site, :advertiser).where(user: current_user).order('sites.name asc, network_advertisers.name asc').pending_block
    if params[:pagesize] == "0"
      @pagestart = 0
    else
      limit      = (params[:pagesize].present? ? params[:pagesize].to_i : 500)
      @pagestart = (params[:pagestart].present? ? params[:pagestart].to_i  : 0)
      @blacklisted_advertisers = @blacklisted_advertisers.limit(limit).offset(@pagestart)
    end
  end

  def whitelisted_advertisers_to_commit
    @fullcount = BlockedAdvertiser.of_network(current_network).joins(:site, :advertiser).where(user: current_user).order('sites.name asc, network_advertisers.name asc').pending_unblock.count
    @whitelisted_advertisers = BlockedAdvertiser.of_network(current_network).joins(:site, :advertiser).where(user: current_user).order('sites.name asc, network_advertisers.name asc').pending_unblock
    if params[:pagesize] == "0"
      @pagestart = 0
    else
      limit      = (params[:pagesize].present? ? params[:pagesize].to_i : 500)
      @pagestart = (params[:pagestart].present? ? params[:pagestart].to_i  : 0)
      @whitelisted_advertisers = @whitelisted_advertisers.limit(limit).offset(@pagestart)
    end
  end

  def blacklisted_advertiser_groups_to_commit
    @fullcount = BlockedAdvertiserGroup.of_network(current_network).joins(:site, :advertiser_block).where(user: current_user).order('sites.name asc, network_advertiser_blocks.name asc').pending_block.count
    @blacklisted_advertiser_groups = BlockedAdvertiserGroup.of_network(current_network).joins(:site, :advertiser_block).where(user: current_user).order('sites.name asc, network_advertiser_blocks.name asc').pending_block
    if params[:pagesize] == "0"
      @pagestart = 0
    else
      limit      = (params[:pagesize].present? ? params[:pagesize].to_i : 500)
      @pagestart = (params[:pagestart].present? ? params[:pagestart].to_i  : 0)
      @blacklisted_advertiser_groups = @blacklisted_advertiser_groups.limit(limit).offset(@pagestart)
    end
  end

  def whitelisted_advertiser_groups_to_commit
    @fullcount = BlockedAdvertiserGroup.of_network(current_network).joins(:site, :advertiser_block).where(user: current_user).order('sites.name asc, network_advertiser_blocks.name asc').pending_unblock.count
    @whitelisted_advertiser_groups = BlockedAdvertiserGroup.of_network(current_network).joins(:site, :advertiser_block).where(user: current_user).order('sites.name asc, network_advertiser_blocks.name asc').pending_unblock
    if params[:pagesize] == "0"
      @pagestart = 0
    else
      limit      = (params[:pagesize].present? ? params[:pagesize].to_i : 500)
      @pagestart = (params[:pagestart].present? ? params[:pagestart].to_i  : 0)
      @whitelisted_advertiser_groups = @whitelisted_advertiser_groups.limit(limit).offset(@pagestart)
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

    default_sites.each do |default_site|
        whitelisted_advertisers_ids = BlockedAdvertiser.of_network(current_network).for_advertiser(advertiser_ids).where(:site_id => default_site.site_id).unblock_or_pending_unblock.pluck("advertiser_id").uniq
        advertisers_for_default_blocks = advertiser_ids - whitelisted_advertisers_ids
        advertisers_for_default_blocks.each do |advertiser_id|
          # default_block => true, will append (Default Block) text next to site name like '123 Greetings (Default Block)'
          ba =  BlockedAdvertiser.new(:advertiser_id => advertiser_id, :site_id => default_site.site_id, :default_block => true)
          advertiser_with_default_blocks.push(ba)
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

  def update_commit_status
    blocks = BlockSite.of_network(current_network).where(user: current_user).pending_block
    unblocks = BlockSite.of_network(current_network).where(user: current_user).pending_unblock

    blocks_to_update_sql = "Update reach_sites_block set state = '#{BlockSite::COMMIT_BLOCK}' where id IN(#{blocks.pluck('id').join(',')})"
    create_block_logs_sql = "insert into reach_block_logs(action, status, site_id, advertiser_id, advertiser_group_id, user_id, created_at, updated_at)
      SELECT 'Block', 'PENDING', site_id, advertiser_id, advertiser_group_id, #{current_user.id}, now(), now()
      from reach_sites_block where (user_id = #{current_user.id} AND state = '#{BlockSite::PENDING_BLOCK}')"

    if blocks.length > 0
      ActiveRecord::Base.connection.execute create_block_logs_sql
      ActiveRecord::Base.connection.execute blocks_to_update_sql
    end

    unblocks_to_update_sql = "Update reach_sites_block set state = '#{BlockSite::COMMIT_UNBLOCK}' where id IN(#{unblocks.pluck('id').join(',')})"
    create_unblock_logs_sql = "insert into reach_block_logs(action, status, site_id, advertiser_id, advertiser_group_id, user_id, created_at, updated_at)
      SELECT 'Unblock', 'PENDING', site_id, advertiser_id, advertiser_group_id, #{current_user.id}, now(), now()
      from reach_sites_block where (user_id = #{current_user.id} AND state = '#{BlockSite::PENDING_UNBLOCK}')"

    if unblocks.length > 0
      ActiveRecord::Base.connection.execute create_unblock_logs_sql
      ActiveRecord::Base.connection.execute unblocks_to_update_sql
    end
  end

  def delete_default_blocks(advertiser_id, exclude_site = [])
    default_sites = DefaultSiteBlocks.of_network(current_network).where.not(:site_id => exclude_site)
    advertiser_with_default_blocks = BlockedAdvertiser.of_network(current_network).where(:advertiser_id => advertiser_id, :site_id => default_sites.pluck("site_id")).pending_block
    if advertiser_with_default_blocks.length == default_sites.length
      advertiser_with_default_blocks.each do |advertiser|
        if advertiser
          advertiser.delete
        end
      end
    end
  end

  def create_or_update_advertisers(advertisers, state)
    # If record exit update it or create new one, since PostgreSQL does not support update or insert
    # delete the existing records and create new one with updated attributes.
    blocks_to_delete = []
    inserts = []
    advertisers.each do |advertiser|
      blocks_to_delete.push "(advertiser_id = #{advertiser["advertiser_id"]} AND site_id = #{advertiser["site_id"]} AND network_id = #{current_network.id})"
      inserts.push "(#{advertiser["advertiser_id"]}, #{advertiser["site_id"]}, '#{state}', 'BlockedAdvertiser', #{current_network.id}, #{current_user.id}, now(), now())"
    end
    delete_sql = "select id from reach_sites_block where(#{blocks_to_delete.join(" OR ")})"
    sql_for_delete_existing_advertiser_blocks = "Delete from reach_sites_block where id IN(#{delete_sql})"

    ActiveRecord::Base.connection.execute sql_for_delete_existing_advertiser_blocks
    sql_for_insert_advertiser_blocks = "INSERT INTO reach_sites_block(advertiser_id, site_id, state, type, network_id, user_id, created_at, updated_at)
          VALUES #{inserts.join(', ')}"

    ActiveRecord::Base.connection.execute sql_for_insert_advertiser_blocks
  rescue => e
    Rails.logger.warn "Block Site error: #{e.message.inspect}"
    respond_with(e.message, status: :service_unavailable)
  end

  def create_or_update_advertiser(advertiser_id, site_id, state)
    ba = BlockedAdvertiser.find_or_initialize_by(:advertiser_id => advertiser_id,:site_id => site_id, :network_id => current_network.id)
    ba.state = state
    ba.user = current_user
    ba.save
  end

  def create_or_update_advertiser_groups(advertiser_groups, state)
    advertiser_groups.each do |advertiser_group|
      create_or_update_advertiser_group(advertiser_group["advertiser_group_id"], advertiser_group["site_id"], state)
    end
  end

  def create_or_update_advertiser_group(advertiser_group_id, site_id, state)
    bag = BlockedAdvertiserGroup.find_or_initialize_by(:advertiser_group_id => advertiser_group_id, :site_id => site_id, :network_id => current_network.id)
    bag.state = state
    bag.user = current_user
    bag.save
end

end
