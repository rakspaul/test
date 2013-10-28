class Admin::DefaultBlockListController < ApplicationController
  include Authenticator

  layout "admin"
  respond_to :html, :json

  add_crumb("Default Blocks") {|instance| instance.send :admin_default_block_list_index_path}

  def index
    @default_site_blocks = DefaultSiteBlocks.of_network(current_network)
    respond_with(@default_site_blocks)
  end

  def create
    create_new_site_blocks(ActiveSupport::JSON.decode(params['newSiteBlocks'])) if params['newSiteBlocks'].present?
    delete_new_site_blocks(ActiveSupport::JSON.decode(params['siteBlocksToDelete'])) if params['siteBlocksToDelete'].present?

    render json: {status: 'success'}

    rescue => e
    respond_with(e.message, status: :service_unavailable)
  end

  def create_new_site_blocks(sites)
    sites.each do |site|
      dsb = DefaultSiteBlocks.find_or_initialize_by(:site_id => site["site_id"], :network_id => current_network.id)
      dsb.user = current_user
      dsb.save
    end
  end

  def delete_new_site_blocks(sites)
    sites.each do |site|
      dsb = DefaultSiteBlocks.find(site['id'])
      if dsb
        dsb.delete
      end
    end
  end

  def export

  end
end
