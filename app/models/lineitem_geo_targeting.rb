class LineitemGeoTargeting < ActiveRecord::Base
  default_scope { where excluded: false }

  belongs_to :lineitem
  belongs_to :geo_target

  before_validation :set_additional_fields

  def set_additional_fields
    self.source_geo_target_id = geo_target.source_id if geo_target.try(:source_id)
    self.network_id           = lineitem.order.network_id if lineitem.try(:order) && lineitem.order.try(:network_id)
  end
end
