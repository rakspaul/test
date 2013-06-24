class AdvertisersController < ApplicationController
  include Authenticator

  def index
    search_query = params[:search]
    @advertisers = Advertiser.of_network(current_network)
      .find_by_name_or_id_or_source_id(search_query)
      .order(:name)
      .limit(50)
  end
end
