class AdvertisersController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    search_query = params[:search]
    @advertisers = Advertiser.of_network(current_network)
      .find_by_name_or_id_or_source_id(search_query)
      .order(:name)
  end

  def search
    search_query = params[:search]
    @advertisers = Advertiser.of_network(current_network).limit(500).order("name  asc")
    unless search_query.blank?
      @advertisers = @advertisers.where("lower(name) ilike lower(?)", "%#{search_query}%")
    end

    respond_with(@advertisers)
  end

  def validate
    advertisers = params[:advertisers].split(/[\n\t\,]+/).map(&:strip).uniq.join(',').split(',')
    advertisers_found = find_advertisers(advertisers)
    missing_advertisers = advertisers - advertisers_found.pluck('name')

    if missing_advertisers.length > 0
      render json: {errors: {advertisers: ["#{missing_advertisers.join(',')} advertiser(s) does not exist."]}}, status: 422
    else
      render json: advertisers_found
    end
  end

  def find_advertisers(advertisers)
    Advertiser.of_network(current_network).where(:name => advertisers)
  end

end
