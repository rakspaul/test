class Admin::BlockViolationsController < ApplicationController
  include Authenticator

  layout "admin"
  respond_to :html

  add_crumb("Block Validation Report") {|instance| instance.send :admin_block_violations_path}

  def index
    sort_direction = params[:sort_direction] ? params[:sort_direction] : "desc"
    sort_column = params[:sort_column] ? params[:sort_column] : "reach_block_violations.created_at"
    site = params[:site] ? params[:site] : ""
    advertiser = params[:advertiser] ? params[:advertiser] : ""
    start_date = params[:start_date] ? params[:start_date].to_date.beginning_of_day : (Date.today - 6.days).beginning_of_day
    end_date = params[:end_date] ? params[:end_date].to_date.end_of_day : Date.today.end_of_day

    if sort_column == "site"
      sort_column = "sites.name"
    elsif sort_column == "advertiser"
      sort_column = "network_advertisers.name"
    elsif sort_column == "job_run_date"
      sort_column = "reach_block_violations.created_at"
    end

    @block_violations = BlockViolations.includes(:advertiser, :site)
                        .filter_by_date(start_date, end_date)
                        .filter_by_site(site)
                        .filter_by_advertiser(advertiser)
                        .references(:advertiser)
                        .references(:site)
                        .order("#{sort_column} #{sort_direction}")
                        .page(params[:page]).per(100);
  end
end
