class Lineitem < ActiveRecord::Base
  self.table_name = "io_lineitems"

  has_paper_trail ignore: [:updated_at]

  belongs_to :order
  belongs_to :user

  has_one :nielsen_pricing, autosave: true

  has_many :ads, foreign_key: 'io_lineitem_id'
  has_many :lineitem_assignments, foreign_key: :io_lineitem_id
  has_many :creatives, through: :lineitem_assignments

  validates :name, :start_date, :end_date, :volume, :rate, presence: true
  validates :order, presence: true
  validates :active, inclusion: { in: [true, false] }
  validates :volume, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :rate, numericality: { greater_than_or_equal_to: 0 }
  validates :ad_sizes, ad_size: true
  validate :flight_dates_with_in_order_range

  before_create :generate_alt_ad_id
  before_save :sanitize_ad_sizes
  after_create :create_nielsen_pricing
  
  def save_creatives(creatives_params)
    creatives_params.each do |params|
      width, height = params[:creative][:ad_size].split(/x/).map(&:to_i)

      creative = Creative.create name: "test.gif", network_advertiser_id: self.order.network_advertiser_id, size: params[:creative][:ad_size], width: width, height: height, creative_type: "HTML", source_ui_creative_id: params[:creative][:ad_id], network_id: self.order.network_id, data_source_id: 1
      LineitemAssignment.create lineitem: self, creative: creative, start_date: params[:creative][:start_date], end_date: params[:creative][:end_date], network_id: self.order.network_id, data_source_id: creative.source_id
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
