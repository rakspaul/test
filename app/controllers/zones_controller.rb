class ZonesController < ActionController::Base
  include Authenticator

  respond_to :json

  def search
    search_query = params[:search]
    site_id = params[:site_id]
    @zones = Zone.joins(:ads).of_network(current_network).of_site(site_id).where("lower(z_site) ilike lower(?)", "%#{search_query}%").distinct unless search_query.blank?
    respond_with(@zones)
  end
end