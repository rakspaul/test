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
    block_advertiser_blocks(ActiveSupport::JSON.decode(params['blocked_advertiser_blocks'])) if params['blocked_advertiser_blocks'].present?

    render json: {status: 'success'}
  end

  def block_advertisers(blocked_advertisers)
    blocked_advertisers.each do |advertiser|
      blocked_advertiser = BlockedAdvertiser.new({
              "advertiser_id" => advertiser["advertiser_id"],
              "site_id" => advertiser["site_id"],
              "state" => "PENDING_BLOCK"
            })
      blocked_advertiser.user = current_user
      blocked_advertiser.network = current_network
      blocked_advertiser.save();
    end
  end

  def block_advertiser_blocks(blocked_advertiser_blocks)
    blocked_advertiser_blocks.each do |advertiser_block|
      blocked_advertiser_block = BlockedAdvertiserBlock.new({
              "advertiser_group_id" => advertiser_block["advertiser_block_id"],
              "site_id" => advertiser_block["site_id"],
              "state" => "PENDING_BLOCK"
            })
      blocked_advertiser_block.user = current_user
      blocked_advertiser_block.network = current_network
      blocked_advertiser_block.save();
    end
  end

end
