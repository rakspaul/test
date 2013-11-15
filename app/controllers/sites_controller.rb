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

  def blacklisted_sites
    search_query = params[:search]
    @sites = Site.of_networks(current_network).where.not(:id => DefaultSiteBlocks.of_network(current_network).pluck("site_id")).limit(500).order("name  asc")
    unless search_query.blank?
      @sites = @sites.where("lower(name) ilike lower(?)", "%#{search_query}%")
    end

    respond_with(@sites)
  end
end