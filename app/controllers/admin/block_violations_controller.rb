class Admin::BlockViolationsController < ApplicationController
  include Authenticator

  layout "admin"
  respond_to :html

  def index
    sort_direction = params[:sort_direction] ? params[:sort_direction] : "desc"
    sort_column = params[:sort_column] ? params[:sort_column] : "reach_block_violations.created_at"

    if sort_column == "site"
      sort_column = "sites.name"
    elsif sort_column == "advertiser"
      sort_column = "network_advertisers.name"
    elsif sort_column == "ad"
      sort_column = "ads.description"
    elsif sort_column == "job_ran_date"
      sort_column = "reach_block_violations.created_at"
    end

    block_violations = BlockViolations.includes(:advertiser).joins(:site, :ad).order("#{sort_column} #{sort_direction}")
    @block_violations = Kaminari.paginate_array(block_violations).page(params[:page]).per(100);
  end
end
