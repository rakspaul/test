class ZonesController < ActionController::Base
  include Authenticator

  respond_to :json

  def search
    search_query = params[:search]
    zones_id = AdZone.select(:zone_id).distinct
    @zones = Zone.find(zones_id.pluck(:zone_id))
    respond_with(@zones)
  end
end