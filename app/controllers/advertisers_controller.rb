class AdvertisersController < ApplicationController
  include Authenticator

  before_filter :load_advertisers

  respond_to :json

  def index
    search_query = params[:search]
    @advertisers = @advertisers.find_by_name_or_id_or_source_id(search_query).order(name: :asc)

    render json: @advertisers.select('network_advertisers.id, source_id, network_advertisers.name').limit(15)
  end

  def search
    search_query = params[:search]
    @advertisers = @advertisers.order(name: :asc).limit(50)
    unless search_query.blank?
      @advertisers = @advertisers.where("lower(network_advertisers.name) ilike lower(?)", "%#{search_query}%")
    end

    respond_with(@advertisers)
  end

  def validate
    advertisers = params[:advertisers].split(/[\n\t\,]+/).map(&:strip).uniq.join(',').split(',')
    advertisers_found = @advertisers.where(:name => advertisers)
    missing_advertisers = advertisers - advertisers_found.pluck('network_advertisers.name')

    render json: {advertisers: advertisers_found, missing_advertisers: missing_advertisers.join('&#xA;').to_s}
  end

  def create
    advertiser = @advertisers.where(:name => params[:name]).first
    if advertiser.blank?
      advertiser = Advertiser.new
      advertiser.name = params[:name]
      advertiser.network = current_network

      advertiser.save
    end
    render json: advertiser
  end

  private
    def load_advertisers
      @advertisers = Advertiser.of_network(current_network).ofType(current_network)
    end

end
