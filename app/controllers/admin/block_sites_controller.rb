class Admin::BlockSitesController < ApplicationController
  include Authenticator

  layout "admin"
  respond_to :html, :json

  add_crumb("Block Sites") {|instance| instance.send :admin_block_sites_path}

  def index
    @blocked_sites = params['type'].present? && params['site_id'].present? ? site_blocks(params['type'], params['site_id']) : []
    respond_with(@blocked_sites)
  end

  def site_blocks(model, site_ids)
    model.constantize.of_network(current_network).where(site_id: site_ids.split(",")).where(state: ['PENDING_BLOCK', 'BLOCK'])
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
       ba = BlockedAdvertiser.find_or_initialize_by(:advertiser_id => advertiser["advertiser_id"],:site_id => advertiser["site_id"])
       ba.user = current_user
       ba.network = current_network
       ba.state = "PENDING_BLOCK"
       ba.save
    end
  end

  def block_advertiser_group(blocked_advertiser_groups)
    blocked_advertiser_groups.each do |advertiser_group|
      bag = BlockedAdvertiserGroup.find_or_initialize_by(:advertiser_group_id => advertiser_group["advertiser_group_id"], :site_id => advertiser_group["site_id"])
      bag.user = current_user
      bag.network = current_network
      bag.state = "PENDING_BLOCK"
      bag.save
    end
  end

  def unblock_sites(unblocked_sites)
    unblocked_sites.each do |block|
      bs = BlockSite.find(block['id'])
      if bs
        bs.state = 'PENDING_UNBLOCK'
        bs.user = current_user
        bs.save
      end
    end
  end

  def commit
    enqueue_for_push
    render json: {status: 'success'}

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
