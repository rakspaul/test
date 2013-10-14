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

      creative = self.lineitem.creatives.find_by(redirect_url: cparams[:redirect_url], size: cparams[:ad_size])
      # updating creative's attributes should be done on lineitem level
      if creative
        if ad_assignment = creative.ad_assignments.find_by(ad_id: self.id)
          ad_assignment.update_attributes(start_date: cparams[:start_date], end_date: cparams[:end_date])
        else
          AdAssignment.create ad: self, creative: creative, start_date: cparams[:start_date], end_date: cparams[:end_date], network_id: self.order.network_id, data_source_id: creative.source_id
        end
      end
    end
  end

  def save_targeting(targeting)
    zipcodes = targeting[:targeting][:selected_zip_codes].to_a.collect do |zipcode|
      Zipcode.find_by(zipcode: zipcode.strip)
    end
    self.zipcodes = zipcodes.compact if !zipcodes.blank?

    dmas = targeting[:targeting][:selected_dmas].to_a.collect{|dma| DesignatedMarketArea.find_by(code: dma[:id])}
    self.designated_market_areas = dmas.compact if !dmas.blank?

    selected_groups = targeting[:targeting][:selected_key_values].to_a.collect do |group_name|
      AudienceGroup.find_by(id: group_name[:id])
    end
    self.audience_groups = selected_groups if !selected_groups.blank?
  end
end
