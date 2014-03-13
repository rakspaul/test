class Admin::BlockLogsController < ApplicationController
  include Authenticator

  layout "admin"
  respond_to :html
  respond_to :csv, :only => :export

  before_filter :require_client_type_network

  add_crumb("Block Push Log") {|instance| instance.send :admin_block_logs_path}

  def index

    sort_direction = params[:sort_direction] ? params[:sort_direction] : "desc"
    sort_column = params[:sort_column] ? params[:sort_column] : "reach_block_logs.created_at"
    site = params[:site] ? params[:site] : ""
    advertiser = params[:advertiser] ? params[:advertiser] : ""
    advertiser_group = params[:advertiser_group] ? params[:advertiser_group] : ""
    start_date = params[:start_date] ? params[:start_date].to_date.beginning_of_day : (Date.today - 6.days).beginning_of_day
    end_date = params[:end_date] ? params[:end_date].to_date.end_of_day : Date.today.end_of_day

    block_logs = filter_block_logs(sort_direction, sort_column, site, advertiser, advertiser_group, start_date, end_date)

    @block_logs = Kaminari.paginate_array(block_logs).page(params[:page]).per(100);
  end

  def export
    sort_direction = params[:sort_direction] ? params[:sort_direction] : "desc"
    sort_column = params[:sort_column] ? params[:sort_column] : "reach_block_logs.created_at"
    site = params[:site] ? params[:site] : ""
    advertiser = params[:advertiser] ? params[:advertiser] : ""
    advertiser_group = params[:advertiser_group] ? params[:advertiser_group] : ""
    start_date = params[:start_date] ? params[:start_date].to_date.beginning_of_day : (Date.today - 6.days).beginning_of_day
    end_date = params[:end_date] ? params[:end_date].to_date.end_of_day : Date.today.end_of_day

    @block_logs = filter_block_logs(sort_direction, sort_column, site, advertiser, advertiser_group, start_date, end_date)
  end

  def filter_block_logs(sort_direction, sort_column, site, advertiser, advertiser_group, start_date, end_date)

    if sort_column == "site"
      sort_column = "sites.name"
    elsif sort_column == "advertiser"
      sort_column = "network_advertisers.name"
    elsif sort_column == "advertiser_group"
      sort_column = "network_advertiser_blocks.name"
    elsif sort_column == "user"
      sort_column = "users.first_name"
    elsif sort_column == "action"
      sort_column = "reach_block_logs.action"
    elsif sort_column == "status"
      sort_column = "reach_block_logs.status"
    elsif sort_column == "created_at"
      sort_column = "reach_block_logs.created_at"
    end

    block_logs = BlockLog.includes(:advertiser, :advertiser_block).joins(:site, :user).of_network(current_network)
                  .order("#{sort_column} #{sort_direction}")
                  .filter_by_date(start_date, end_date)
                  .filter_by_site(site)
                  .filter_by_advertiser(advertiser)
                  .filter_by_advertiser_group(advertiser_group)

    return block_logs
  end
end
