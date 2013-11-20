class AdPricing < ActiveRecord::Base
  belongs_to :ad
  belongs_to :data_source
  belongs_to :network

  validates :quantity, numericality: { only_integer: true, less_than_or_equal_to: ->(rec) { rec.ad.lineitem.volume.to_i }, message: "Ad Impressions exceed Line Item Impressions" }

  before_create :create_random_source_id
  before_validation :sanitize_attributes
  before_save :set_data_source

  def create_random_source_id
    self.source_id = "R_#{SecureRandom.uuid}"
  end

private

  def sanitize_attributes
    # number of impressions could come in format like 11,234 which would be just 11 after the typecast
    quantity_before_typecast = self.read_attribute_before_type_cast('quantity')
    self[:quantity] = quantity_before_typecast.gsub(/,|\./, '') if quantity_before_typecast.is_a?(String)
  end

  def set_data_source
    self.data_source = self.network.data_source
  end
end
