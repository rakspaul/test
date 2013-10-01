class AdSizesController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @adsizes = current_network.ad_sizes.where.not(:size => nil)
    @adsizes = @adsizes.where(["size LIKE ?", "#{params[:search]}%"]) if params[:search]
    respond_with(@adsizes)
  end
end
