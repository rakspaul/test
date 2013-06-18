class AdSizesController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @adsizes = current_network.ad_sizes.where.not(:size => nil)
    respond_with(@adsizes)
  end
end
