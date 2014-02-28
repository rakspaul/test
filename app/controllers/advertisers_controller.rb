class AdvertisersController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    search_query = params[:search]
    @advertisers = Advertiser.of_network(current_network)
      .find_by_name(search_query)
      .of_type_advertiser
      .order("CASE WHEN network_advertisers.name like '#{search_query}%' THEN 0
               WHEN network_advertisers.name like '% %#{search_query}% %' THEN 1
               WHEN network_advertisers.name like '%#{search_query}' THEN 2
               ELSE 3
          END, network_advertisers.name")
    render json: @advertisers.select('network_advertisers.id, source_id, network_advertisers.name').limit(100)
  end

  def search
    search_query = params[:search]
    @advertisers = Advertiser.of_network(current_network)
      .of_type_advertiser
      .limit(500)
      .order("name  asc")
    unless search_query.blank?
      @advertisers = @advertisers.where("lower(network_advertisers.name) ilike lower(?)", "%#{search_query}%")
    end

    respond_with(@advertisers)
  end

  def validate
    advertisers = params[:advertisers].split(/[\n\t\,]+/).map(&:strip).uniq.join(',').split(',')
    advertisers_found = Advertiser.of_network(current_network).where(:name => advertisers)
    missing_advertisers = advertisers - advertisers_found.pluck('network_advertisers.name')

    render json: {advertisers: advertisers_found, missing_advertisers: missing_advertisers.join('&#xA;').to_s}
  end

  private
    def find_advertisers(advertisers)
      Advertiser.of_network(current_network).of_type_advertiser.where(:name => advertisers)
    end
end
