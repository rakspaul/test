class SitesController < ApplicationController
  include Authenticator

  respond_to :json

  def search
    search_query = params[:search]
    @sites = Site.of_networks(current_network).limit(500).order("name  asc")
    unless search_query.blank?
      @sites = @sites.where("lower(name) ilike lower(?)", "%#{search_query}%")
    end

    respond_with(@sites)
  end
end