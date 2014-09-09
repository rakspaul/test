class Desk::AdvertisersController < ApplicationController
  include Authenticator

  before_filter :require_agency, :only => [:index, :search]

  respond_to :json

  def index
    @advertisers = Order.where(:agency_id => @agency.id)
                        .joins(:advertiser)
                        .select('network_advertiser_id as id, network_advertisers.name as name').distinct
  end

  def search
    @advertisers_search = Order.where(:agency_id => @agency.id)
                        .joins(:advertiser)
                        .where("lower(network_advertisers.name) ilike lower(?)", "%#{params[:search]}%")
                        .select('network_advertiser_id as id, network_advertisers.name as name').distinct
  end

  def list_network_advertisers
    @all_advertisers = Order.of_network(current_network)
                            .joins(:advertiser)
                            .select('network_advertiser_id as id, network_advertisers.name as name').distinct
  end

  def search_network_advertisers
    @all_advertisers_search = Order.of_network(current_network)
                            .joins(:advertiser)
                            .where("lower(network_advertisers.name) ilike lower(?)", "%#{params[:search]}%")
                            .select('network_advertiser_id as id, network_advertisers.name as name').distinct
  end

  private

  def require_agency
    @agency ||= Agency.find_by_id(params[:agency_id])
  end
end
