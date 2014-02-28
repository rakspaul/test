class Admin::DefaultBlockListController < ApplicationController
  include Authenticator

  layout "admin"
  respond_to :html, :json

  before_filter :require_client_type_network

  add_crumb("Default Blocks") {|instance| instance.send :admin_default_block_list_index_path}

  def index
    @default_site_blocks = DefaultSiteBlocks.joins(:site).of_network(current_network).order("Sites.name asc")
    respond_with(@default_site_blocks)
  end

  def create
    create_new_site_blocks(ActiveSupport::JSON.decode(params['newSiteBlocks'])) if params['newSiteBlocks'].present?
    delete_site_blocks(ActiveSupport::JSON.decode(params['siteBlocksToDelete'])) if params['siteBlocksToDelete'].present?

    render json: {status: 'success'}

    rescue => e
    respond_with(e.message, status: :service_unavailable)
  end

  def export
    default_site_blocks = DefaultSiteBlocks.joins(:site).of_network(current_network).order("Sites.name asc")
    create_sheet

    row_no = 0

    header = @sheet.row(row_no)
    header.default_format=(@format_color)
    header[0] = "Default Block sites"

    default_site_blocks.each do |dsb|
      row_no +=1
      site_data = @sheet.row(row_no)
      site_data[0] = dsb.site.name
    end

    spreadsheet = StringIO.new
    @book.write spreadsheet

    send_data spreadsheet.string, :filename => get_default_block_site_name, :x_sendfile => true, :type => "application/vnd.ms-excel"

  rescue => e
    render json: { errors: e.message }, status: :unprocessable_entity
  end

  def whitelisted_sites
    search_query = params[:search]
    @default_site_blocks = DefaultSiteBlocks.of_network(current_network).joins(:site).limit(500).order("Sites.name  asc")
    unless search_query.blank?
      @default_site_blocks = @default_site_blocks.where("lower(Sites.name) ilike lower(?)", "%#{search_query}%")
    end

    respond_with(@default_site_blocks)
  end

  private

  def create_new_site_blocks(sites)
    sites.each do |site|
      dsb = DefaultSiteBlocks.find_or_initialize_by(:site_id => site["site_id"], :network_id => current_network.id)
      dsb.user = current_user
      block_site_on_advertisers_having_default_blocks(dsb.site_id) if dsb.save
    end
  end

  def delete_site_blocks(sites)
    sites.each do |site|
      dsb = DefaultSiteBlocks.find(site['id'])
      if dsb
        dsb.delete
      end
    end
  end

  def block_site_on_advertisers_having_default_blocks(site_id)
    default_sites = DefaultSiteBlocks.of_network(current_network).where.not(:site_id => site_id)

    blocked_advertiser_ids = BlockedAdvertiser.of_network(current_network).block_or_pending_block.pluck("advertiser_id").uniq
    blocked_advertiser_ids.each do |advertiser_id|
      blocked_advertisers_on_default_sites = BlockedAdvertiser.of_network(current_network).where(:advertiser_id => advertiser_id, :site_id => default_sites.pluck("site_id")).block_or_pending_block

      if blocked_advertisers_on_default_sites.length == default_sites.length
        ba = BlockedAdvertiser.find_or_initialize_by(:advertiser_id => advertiser_id,:site_id => site_id, :network_id => current_network.id)
        ba.state = BlockedAdvertiser::BLOCK
        ba.user = current_user
        ba.save
      end
    end
  end

  def create_sheet
    Spreadsheet.client_encoding = 'UTF-8'

    @format = Spreadsheet::Format.new :color => :black, :weight => :bold, :size => 10
    @format_color = Spreadsheet::Format.new :color => :black, :weight => :bold, :size => 11, :pattern_fg_color => :Gray, :pattern => 2

    @book = Spreadsheet::Workbook.new
    @sheet = @book.create_worksheet :name => "Default Blocked Sites"
  end

  def get_default_block_site_name
    "#{@current_user.network.name}_Default_Blocked_Sites_#{Date.today.strftime('%Y-%m-%d')}.xls"
  end

end
