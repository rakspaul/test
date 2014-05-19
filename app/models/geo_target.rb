class GeoTarget < ActiveRecord::Base


  TYPES = {
    'CITY'        => GeoTarget::City,
    'COUNTRY'     => GeoTarget::Country,
    'STATE'       => GeoTarget::State,
    'DMA_REGION'  => GeoTarget::DesignatedMarketArea,
    'POSTAL_CODE' => GeoTarget::Zipcode
  }

  scope :xfp_present, -> { where('source_id IS NOT NULL and targetable = true') }
  scope :in_us, -> { where('country_code = ?', 'US')}

  has_many :lineitem_geo_targetings, foreign_key: :geo_target_id
  has_many :lineitems, through: :lineitem_geo_targetings
  has_many :ad_geo_targetings, foreign_key: :geo_target_id
  has_many :ads, through: :ad_geo_targetings

  class << self
    def find_sti_class(type_name)
      TYPES[type_name] or self
    end
 
    def sti_name
      TYPES.invert[self]
    end

    def search(search_str)
      geos = []
      geos += GeoTarget::DesignatedMarketArea.order(:name).where(['name ilike ?', "#{search_str}%"]).limit(10)
      geos += GeoTarget::State.in_us.xfp_present.order(:name).where(['name ilike ?', "#{search_str}%"]).limit(10)
      geos += GeoTarget::City.in_us.xfp_present.includes(:state).order(:name).where(['name ilike ?', "#{search_str}%"]).limit(10)
      geos
    end
  end
end
