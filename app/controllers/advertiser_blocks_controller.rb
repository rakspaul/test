class AdvertiserBlocksController < ApplicationController
  include Authenticator

  respond_to :json

  def search
    search_query = params[:search]
    @advertiser_blocks = AdvertiserBlock.of_network(current_network).limit(500).order("name  asc")
    unless search_query.blank?
      @advertiser_blocks = @advertiser_blocks.where("lower(name) ilike lower(?)", "%#{search_query}%")
    end

    respond_with(@advertiser_blocks)
  end

  def show
    advertiser_blocks = AdvertiserBlock.of_network(current_network).find(params[:id])
    @advertisers = advertiser_blocks.try(:advertisers).order("network_advertisers.name  asc")
  end

end
