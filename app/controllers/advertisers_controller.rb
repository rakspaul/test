class AdvertisersController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    search_query = params[:search]
    @advertisers = Advertiser.of_network(current_network)
      .find_by_name_or_id_or_source_id(search_query)
      .order(:name)
      .limit(50)
  end

  def search
    search_query = params[:search]
    @advertisers = Advertiser.of_network(current_network).limit(500).order("name  asc")
    unless search_query.blank?
      @advertisers = @advertisers.where("lower(name) ilike lower(?)", "%#{search_query}%")
    end

    respond_with(@advertisers)
  end

end
