class ZonesController < ActionController::Base
  include Authenticator

  respond_to :json

  def search
    search_query = params[:search]
    zones_id = AdZone.select(:zone_id).distinct
    @zones = Zone.where(id: zones_id.pluck(:zone_id))

    unless search_query.blank?
      @zones = @zones.where("lower(z_site) ilike lower(?)", "%#{search_query}%")
    end
    respond_with(@zones)
  end
end