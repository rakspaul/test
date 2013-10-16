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
    model.constantize.of_network(current_network).where(advertiser_id: advertiser_id.split(",")).where(state: [BlockSite::PENDING_BLOCK, BlockSite::BLOCK])
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

private

  def enqueue_for_push
    require 'bunny'

    connection = Bunny.new(:host => '127.0.0.1')
    connection.start

    channel = connection.create_channel
    queue = channel.queue("reach.sites.block", :durable => true)

    Rails.logger.warn "Block Site: Commit started by User: #{current_user.account_login} (Name: #{current_user.full_name}, Email: #{current_user.email}) of Network: #{current_network.name} at #{Time.now}"
    msg = current_user.id

    queue.publish(msg, :persistent => true)
    Rails.logger.warn " [reach.sites.block] Sent #{msg}"

    connection.close

    rescue => e
    Rails.logger.warn "Block Site error: #{e.message.inspect}"
  end

end
