class Lineitem < ActiveRecord::Base
  self.table_name = "io_lineitems"

  has_paper_trail ignore: [:updated_at]

  belongs_to :order
  belongs_to :user

  has_one :nielsen_pricing, autosave: true

  has_many :ads, foreign_key: 'io_lineitem_id'
  has_many :lineitem_assignments, foreign_key: :io_lineitem_id
  has_many :creatives, through: :lineitem_assignments

  has_and_belongs_to_many :designated_market_areas, join_table: :dmas_lineitems, association_foreign_key: :designated_market_area_id
  has_and_belongs_to_many :audience_groups, join_table: :lineitems_reach_audience_groups, association_foreign_key: :reach_audience_group_id

  validates :name, :start_date, :end_date, :volume, :rate, presence: true
  validates :order, presence: true
  validates :active, inclusion: { in: [true, false] }
  validates :volume, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :rate, numericality: { greater_than_or_equal_to: 0 }
  validates :ad_sizes, ad_size: true
  validate :flight_dates_with_in_order_range

  before_create :generate_alt_ad_id
  before_save :sanitize_ad_sizes
  before_validation :sanitize_attributes
  after_create :create_nielsen_pricing
  
  def save_creatives(creatives_params)
    creatives_params.each do |params|
      cparams = params[:creative]
      width, height = cparams[:ad_size].split(/x/).map(&:to_i)
Rails.logger.warn 'cparams[:id] in li ' + cparams[:id].inspect
      if cparams[:id]
        creative = Creative.find cparams[:id]
        creative.update_attributes(size: cparams[:ad_size], source_ui_creative_id: cparams[:ad_id], width: width, height: height)
        creative.ad_assignment.update_attributes(start_date: cparams[:start_date], end_date: cparams[:end_date])
      else
        creative = Creative.create name: "test.gif", network_advertiser_id: self.order.network_advertiser_id, size: cparams[:ad_size], width: width, height: height, creative_type: "HTML", source_ui_creative_id: cparams[:ad_id], network_id: self.order.network_id, data_source_id: 1
        LineitemAssignment.create lineitem: self, creative: creative, start_date: cparams[:start_date], end_date: cparams[:end_date], network_id: self.order.network_id, data_source_id: creative.source_id
      end
    end
  end

  private

    def flight_dates_with_in_order_range
      if(self.start_date < self.order.start_date)
        errors.add(:start_date, "can not be before start date of order")
      end

      if self.end_date > self.order.end_date
        errors.add(:end_date, "can not be after end date of order")
      end
    end

    def sanitize_ad_sizes
      self.ad_sizes.delete!(' ')
    end

    def sanitize_attributes
      # number of impressions could come in format like 11,234 which would be just 11 after the typecast
      volume_before_typecast = self.read_attribute_before_type_cast('volume')
      self[:volume] = volume_before_typecast.gsub(/,|\./, '') if volume_before_typecast.is_a?(String)
    end

    def create_nielsen_pricing
      nielsen_pricing.save! if nielsen_pricing
    end

    def generate_alt_ad_id
      if self.alt_ad_id.nil?
        max_alt_id = Lineitem.where(order_id: order_id).pluck('alt_ad_id').map{|s| s.to_i}.max || 0
        self.alt_ad_id = max_alt_id + 1
      end
    end
end
