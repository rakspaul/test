class ZonesController < ActionController::Base
  include Authenticator

  respond_to :json

  def search
    search_query = params[:search]
    @zones = Zone.joins(:ads).of_network(current_network).where("lower(z_site) ilike lower(?)", "%#{search_query}%") unless search_query.blank?
    respond_with(@zones)
  end
end