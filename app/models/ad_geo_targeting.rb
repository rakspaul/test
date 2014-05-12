class AdGeoTargeting < ActiveRecord::Base
  default_scope { where excluded: false }

  belongs_to :ad
  belongs_to :geo_target

  before_validation :set_additional_fields

  def set_additional_fields
    self.source_ad_id         = ad.source_id         if ad.try(:source_id)
    self.source_geo_target_id = geo_target.source_id if geo_target.try(:source_id)
    self.network_id           = ad.network_id if ad.try(:network_id)
  end
end
