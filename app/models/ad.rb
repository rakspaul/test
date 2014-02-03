class Ad < ActiveRecord::Base
  belongs_to :order
  belongs_to :lineitem, foreign_key: 'io_lineitem_id'
  belongs_to :data_source
  belongs_to :network
  belongs_to :media_type

  has_one :ad_pricing, dependent: :destroy

  has_many :ad_assignments
  has_many :creatives, through: :ad_assignments

  has_and_belongs_to_many :zipcodes, join_table: :zipcode_targeting
  has_and_belongs_to_many :designated_market_areas, join_table: :dma_targeting, association_foreign_key: :dma_id
  has_and_belongs_to_many :audience_groups, join_table: :ads_reach_audience_groups, association_foreign_key: :reach_audience_group_id

  validates :description, uniqueness: { message: "Ad name is not unique", scope: :order }

  validates :start_date, future_date: true, :if => lambda {|ad| ad.start_date_was.try(:to_date) != ad.start_date.to_date || ad.new_record? }
  validates_dates_range :end_date, after: :start_date, :if => lambda {|ad| ad.end_date_was.try(:to_date) != ad.end_date.to_date || ad.new_record? }

  before_validation :sanitize_attributes
  before_create :create_random_source_id
  before_save :move_end_date_time, :set_data_source, :set_type_params
  before_validation :check_flight_dates_within_li_flight_dates
  after_save :update_creatives_name

  def dfp_url
    "#{ order.network.try(:dfp_url) }/LineItemDetail/orderId=#{ order.source_id }&lineItemId=#{ source_id }"
  end

  def type
    return 'Companion' if media_type.category == 'Display' && lineitem.type == 'Video'
    media_type.category
  end

  # since all Creatives on Ad level are already present or created on LI level => no need to create or update any Creatives here
  def save_creatives(creatives_params)
    creatives_errors = {}

    creatives_params.to_a.each_with_index do |params, i|
      cparams = params[:creative]
      width, height = cparams[:ad_size].split(/x/).map(&:to_i)
      end_date = Time.zone.parse(cparams[:end_date]).end_of_day

      creative = self.lineitem.creatives.find_by(redirect_url: cparams[:redirect_url], size: cparams[:ad_size])
      # updating creative's attributes should be done on lineitem level
      if creative
        if ad_assignment = creative.ad_assignments.find_by(ad_id: self.id)
          if !ad_assignment.update_attributes(start_date: cparams[:start_date], end_date: end_date)
            creatives_errors[i] = ad_assignment.errors.messages
          end
        else
          ad_assignment = AdAssignment.create(ad: self, creative: creative, start_date: cparams[:start_date], end_date: end_date, network: self.network)
          if !ad_assignment.errors.messages.blank?
            creatives_errors[i] = ad_assignment.errors.messages
          end
        end
      end
    end

    creatives_errors
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

  def create_random_source_id
    self.source_id = "R_#{SecureRandom.uuid}"
  end

  def set_data_source
    self.data_source = self.network.data_source
  end

  def set_type_params
    if type == 'Companion'
      self.ad_type  = Video::COMPANION_AD_TYPE
      self.priority = Video::COMPANION_PRIORITY
    end and return

    self.ad_type  = "#{media_type.category}::AD_TYPE".constantize
    if type == 'Display' && (audience_groups.size > 0 || !reach_custom_kv_targeting.blank?)
      self.priority = "#{media_type.category}::HIGH_PRIORITY".constantize
    else
      self.priority = "#{media_type.category}::PRIORITY".constantize
    end
  end

  def pushed_to_dfp?
    self.source_id.to_i != 0
  end

  def sanitize_attributes
    # https://github.com/collectivemedia/reachui/issues/136
    self[:description] = description.strip[0..254]
    self[:source_id]   = self.source_id_was unless new_record?
  end

  def move_end_date_time
    self.end_date = self.end_date.end_of_day
  end

  def check_flight_dates_within_li_flight_dates
    if self.lineitem
      if self.start_date.to_date < self.lineitem.start_date.to_date
        self.errors.add(:start_date, "couldn't be before lineitem's start date")
      end

      if self.end_date.to_date > self.lineitem.end_date.to_date
        self.errors.add(:end_date, "couldn't be after lineitem's end date")
      end
    end
  end

  def update_creatives_name
    self.reload # update relations
    self.creatives.each do |creative|
      creative_name = "#{self.description.to_s.gsub(/\s*\d+x\d+,?/, '')} #{creative.size}"
      creative.update_attribute :name, creative_name
    end
  end
end
