class Ad < ActiveRecord::Base
  belongs_to :order
  belongs_to :lineitem, foreign_key: 'io_lineitem_id'

  has_one :ad_pricing, dependent: :destroy

  has_many :ad_assignments
  has_many :creatives, through: :ad_assignments

  has_and_belongs_to_many :zipcodes, join_table: :zipcode_targeting
  has_and_belongs_to_many :designated_market_areas, join_table: :dma_targeting, association_foreign_key: :dma_id
  has_and_belongs_to_many :audience_groups, join_table: :ads_reach_audience_groups, association_foreign_key: :reach_audience_group_id

  validates :description, uniqueness: { message: "The following Ads have duplicate names. Please ensure the Ad names are unique", scope: :order_id }
  validates :start_date, future_date: true
  validates_dates_range :end_date, after: :start_date

  # since all Creatives on Ad level are already present or created on LI level => no need to create any Creatives here
  def save_creatives(creatives_params)
    creatives_params.to_a.each do |params|
      cparams = params[:creative]
      width, height = cparams[:ad_size].split(/x/).map(&:to_i)

      creative = Creative.find_by(redirect_url: cparams[:redirect_url], size: cparams[:ad_size], source_ui_creative_id: cparams[:source_ui_creative_id].to_s)
      if creative
        creative.update_attributes(size: cparams[:ad_size], source_ui_creative_id: cparams[:source_ui_creative_id], width: width, height: height, redirect_url: cparams[:redirect_url])

        if creative.ad_assignment
          creative.ad_assignment.update_attributes(start_date: cparams[:start_date], end_date: cparams[:end_date])
        else
          AdAssignment.create ad: self, creative: creative, start_date: cparams[:start_date], end_date: cparams[:end_date], network_id: self.order.network_id, data_source_id: creative.source_id
        end
      end
    end
  end
end
