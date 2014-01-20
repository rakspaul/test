class Admin::BlockLogsController < ApplicationController
  include Authenticator

  layout "admin"
  respond_to :html, :json

  add_crumb("Block Push Log") {|instance| instance.send :admin_block_logs_path}

  def index

    sort_direction = params[:sort_direction] ? params[:sort_direction] : "desc"
    sort_column = params[:sort_column] ? params[:sort_column] : "created_at"

    if sort_column == "site"
      sort_column = "sites.name"
    elsif sort_column == "advertiser"
      sort_column = "network_advertisers.name"
    elsif sort_column == "advertiser_group"
      sort_column = "network_advertiser_blocks.name"
    elsif sort_column == "user"
      sort_column = "users.first_name"
    end

    block_logs = BlockLog.includes(:advertiser, :advertiser_block).joins(:site, :user).of_network(current_network).order("#{sort_column} #{sort_direction}")
    @block_logs = Kaminari.paginate_array(block_logs).page(params[:page]).per(50);
  end
end
