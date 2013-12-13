class AdvertisersController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    search_query = params[:search]
    @advertisers = Advertiser.of_network(current_network)
      .find_by_name_or_id_or_source_id(search_query)
      .order(:name)
    render json: @advertisers.select('network_advertisers.id, source_id, network_advertisers.name').limit(15)
  end

  def search
    search_query = params[:search]
    @advertisers = Advertiser.of_network(current_network).limit(50).order("name  asc")
    unless search_query.blank?
      @advertisers = @advertisers.where("lower(network_advertisers.name) ilike lower(?)", "%#{search_query}%")
    end

    respond_with(@advertisers)
  end

  def validate
    advertisers = params[:advertisers].split(/[\n\t\,]+/).map(&:strip).uniq.join(',').split(',')
    advertisers_found = find_advertisers(advertisers)
    missing_advertisers = advertisers - advertisers_found.pluck('network_advertisers.name')

    render json: {advertisers: advertisers_found, missing_advertisers: missing_advertisers.join('&#xA;').to_s}
  end

  def create
    advertiser = find_advertisers(params[:name]).first
    if advertiser.blank?
      advertiser = Advertiser.new
      advertiser.name = params[:name]
      advertiser.network = current_network

      advertiser.save
    end
    render json: advertiser
  end

  private
    def find_advertisers(advertisers)
      Advertiser.of_network(current_network).where(:name => advertisers)
    end

end
