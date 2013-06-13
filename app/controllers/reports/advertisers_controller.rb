class Reports::AdvertisersController < ApplicationController
  include Authenticator

  add_crumb("Advertisers") {|instance| instance.send :reports_advertisers_path}

  respond_to :html, :js, :json, :csv

  def index
  	@advertisers = Report::Advertiser.of_network(current_network).limit(500)
  	respond_with(@advertisers)
  end

  def new
  end

end