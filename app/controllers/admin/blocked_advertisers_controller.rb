class Admin::BlockedAdvertisersController < ApplicationController
  include Authenticator

  layout "admin"
  respond_to :html, :json

  before_filter :require_client_type_network

  add_crumb("Blocked Advertisers") {|instance| instance.send :admin_blocked_advertisers_path}

  def index
  end

  def get_blocked_sites_on_advertiser
    if params['advertiser_id'].present?
      advertiser_ids = params['advertiser_id'].split(",").map(&:to_i)
      blocked_sites_on_advertiser(advertiser_ids)
    end
  end

  def get_blocked_sites_on_advertiser_group
    if params['advertiser_group_id'].present?
      advertiser_group_ids = params['advertiser_group_id'].split(",").map(&:to_i)
      @blocked_sites = blocked_sites_on_advertiser_group(advertiser_group_ids);
      advertiser_groups_with_blocks = @blocked_sites.pluck("advertiser_group_id").uniq
      advertiser_groups_with_no_blocks = advertiser_group_ids - advertiser_groups_with_blocks
      @blocked_sites = @blocked_sites + get_advertiser_groups_with_no_blocks(advertiser_groups_with_no_blocks)
    end
  end

  def export_blocked_sites_on_advertisers
    if params['advertiser_id'].present?
      advertiser_ids = params['advertiser_id'].split(",").map(&:to_i)
      block_advertiser_and_group_export = BlockAdvertiserAndGroupExport.new(current_user)
      send_data block_advertiser_and_group_export.export_advertiser(blocked_sites_on_advertiser(advertiser_ids)), :filename => block_advertiser_and_group_export.get_adv_file, :x_sendfile => true, :type => "application/vnd.ms-excel"
    else
      render json: {status: 'error', message: 'No advertisers selected to export.'}
    end

    rescue => e
      render json: { errors: e.message }, status: :unprocessable_entity
  end

  def export_blocked_sites_on_advertiser_groups
    if params['advertiser_group_id'].present?
      advertiser_group_ids = params['advertiser_group_id'].split(",").map(&:to_i)
      block_advertiser_and_group_export = BlockAdvertiserAndGroupExport.new(current_user)
      send_data block_advertiser_and_group_export.export_advertiser_group(blocked_sites_on_advertiser_group(advertiser_group_ids)), :filename => block_advertiser_and_group_export.get_adv_group_file, :x_sendfile => true, :type => "application/vnd.ms-excel"
    else
      render json: {status: 'error', message: 'No advertiser groups selected to export.'}
    end

    rescue => e
      render json: { errors: e.message }, status: :unprocessable_entity
  end


private

  def blocked_sites_on_advertiser(advertiser_ids)
    @blocked_sites = BlockedAdvertiser.of_network(current_network).where(:advertiser_id => advertiser_ids).block_or_pending_block

    advertiser_with_blocks = @blocked_sites.pluck("advertiser_id").uniq
    #find advertisers who don’t have any block rule (advertisers requested minus advertisers found)
    advertiser_with_no_blocks = advertiser_ids - advertiser_with_blocks

    @blocked_sites = @blocked_sites + get_default_site_blocks_for_advertisers(advertiser_with_no_blocks)
  end

  def blocked_sites_on_advertiser_group(advertiser_group_ids)
      @blocked_sites = BlockedAdvertiserGroup.of_network(current_network).where(:advertiser_group_id => advertiser_group_ids).block_or_pending_block
  end

  # this function will take advertisers ids as parameter and will apply default blocks to them.
  def get_default_site_blocks_for_advertisers(advertiser_ids)
    advertiser_with_default_blocks = []
    default_sites = DefaultSiteBlocks.of_network(current_network)

    advertiser_ids.each do |id|
      advertiser = Advertiser.find(id)
      default_block = !is_unblocked_on_default_blocks(id, default_sites)
      if advertiser
        default_sites.each do |default_site|
          advertiser_whitelisted = BlockedAdvertiser.of_network(current_network).where(:advertiser => advertiser, :site => default_site.site).unblock_or_pending_unblock.first
          if !advertiser_whitelisted
            # default_block => true, will append (Default Block) text next to site name like '123 Greetings (Default Block)'
            ba =  BlockedAdvertiser.new(:advertiser => advertiser, :site => default_site.site, :default_block => default_block)
            advertiser_with_default_blocks.push(ba)
          end
        end
      end
    end

    return advertiser_with_default_blocks
  end

  def is_unblocked_on_default_blocks (advertiser_id, default_sites)
    unblocked_advertisers_on_default_sites_count = BlockedAdvertiser.of_network(current_network).where(:advertiser_id => advertiser_id, :site_id => default_sites.pluck("site_id")).unblock_or_pending_unblock.count
    default_block = false
    if unblocked_advertisers_on_default_sites_count > 0
      default_block = true
    end
    return default_block
  end

  def get_advertiser_groups_with_no_blocks(advertiser_group_ids)
    blocked_advertiser_groups = AdvertiserBlock.find(advertiser_group_ids)
    blocks = []
    blocked_advertiser_groups.each do |blocked_advertiser_group|
      block = BlockedAdvertiserGroup.new({:advertiser_block => blocked_advertiser_group});
      blocks.push(block);
    end
    return blocks;
  end

end