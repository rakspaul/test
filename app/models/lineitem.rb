class Lineitem < ActiveRecord::Base
  self.table_name = "io_lineitems"

  has_paper_trail ignore: [:updated_at]

  attr_accessor :li_id

  belongs_to :order
  belongs_to :user
  belongs_to :media_type

  has_one :nielsen_pricing, autosave: true, dependent: :destroy

  has_many :ads, foreign_key: 'io_lineitem_id', dependent: :destroy
  has_many :lineitem_assignments, foreign_key: :io_lineitem_id, dependent: :destroy
  has_many :creatives, through: :lineitem_assignments
  has_many :lineitem_video_assignments, foreign_key: :io_lineitem_id, dependent: :destroy
  has_many :video_creatives, through: :lineitem_video_assignments

  has_and_belongs_to_many :designated_market_areas, join_table: :dmas_lineitems, association_foreign_key: :designated_market_area_id
  has_and_belongs_to_many :cities, join_table: :cities_lineitems, association_foreign_key: :city_id
  has_and_belongs_to_many :states, join_table: :states_lineitems, association_foreign_key: :state_id

  has_and_belongs_to_many :audience_groups, join_table: :lineitems_reach_audience_groups, association_foreign_key: :reach_audience_group_id

  validates :name, :start_date, :end_date, :volume, :rate, presence: true
  validates :order, presence: true
  validates :active, inclusion: { in: [true, false] }
  validates :volume, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :rate, numericality: { greater_than_or_equal_to: 0 }
  validates :ad_sizes, ad_size: true
  validate :flight_dates_with_in_order_range

  # applying #to_date because li.start_date_was could be 23:59:59 and current start_date could be 0:00:00
  validates :start_date, future_date: true, :if => lambda {|li| li.start_date_was.try(:to_date) != li.start_date.to_date || li.new_record? }

  # applying #to_date because li.end_date_was could be 23:59:59 and current end_date could be 0:00:00
  validates_dates_range :end_date, after: :start_date, :if => lambda {|li| li.end_date_was.try(:to_date) != li.end_date.to_date || li.new_record? }

  before_create :generate_alt_ad_id
  before_save :sanitize_ad_sizes, :move_end_date_time
  before_validation :sanitize_attributes
  after_create :create_nielsen_pricing

  def video?()   type == 'Video'; end
  def display?() type == 'Display'; end

  def save_creatives(creatives_params)
    creatives_errors = {}

    creatives_params.to_a.each_with_index do |params, i|
      cparams = params[:creative]
      creative_type = cparams[:creative_type] == "ThirdPartyCreative" ? "ThirdPartyCreative" : "InternalRedirectCreative"
      if creative_type == "ThirdPartyCreative"
        html_code = html_unescape(cparams[:html_code])
      else
        url       = cparams[:redirect_url].try(:gsub, '/ad/', '/adj/').to_s
        html_code = '<script language="JavaScript" src="'+url+';click=%%CLICK_URL_UNESC%%;ord=%%CACHEBUSTER%%?" type="text/javascript"></script>'
      end

      width, height = cparams[:ad_size].split(/x/).map(&:to_i)

      if 1 == width && 1 == height
        is_video_creative = true
        creative_model = VideoCreative
        lineitem_assignment_model = LineitemVideoAssignment
      else
        is_video_creative = false
        creative_model = Creative
        lineitem_assignment_model = LineitemAssignment
      end

      end_date = Time.zone.parse(cparams[:end_date]).end_of_day
      creative_name = ad_name(cparams[:start_date], cparams[:ad_size])

      if cparams[:id] && creative = creative_model.find_by_id(cparams[:id])
        creative.update_attributes(name: creative_name, size: cparams[:ad_size], width: width, height: height, redirect_url: cparams[:redirect_url], html_code: html_code, network_advertiser_id: self.order.network_advertiser_id, network: self.order.network)
        creative.update_attribute(:creative_type, creative_type) if creative.class.to_s == "Creative"
      else
        creative = creative_model.new name: creative_name, network_advertiser_id: self.order.network_advertiser_id, size: cparams[:ad_size], width: width, height: height, redirect_url: cparams[:redirect_url], html_code: html_code, network: self.order.network
        creative.creative_type = creative_type if creative.class.to_s == "Creative"
        creative.save
      end

      if creative.lineitem_assignment
        if !creative.lineitem_assignment.update_attributes(start_date: cparams[:start_date], end_date: end_date)
          creatives_errors[i] = creative.lineitem_assignment.errors.messages
        end
      else
        li_assignment = lineitem_assignment_model.new lineitem: self, start_date: cparams[:start_date], end_date: end_date, network_id: self.order.network_id, data_source_id: self.order.network.try(:data_source_id)

        if is_video_creative
          li_assignment.video_creative = creative
        else
          li_assignment.creative = creative
        end
        li_assignment.save

        if !li_assignment.errors.messages.blank?
          creatives_errors[i] = li_assignment.errors.messages
        end
      end
    end

    creatives_errors
  end

  def create_geo_targeting(targeting)
    dmas = targeting.select{|geo| geo["type"] == 'DMA'}.collect{|dma| DesignatedMarketArea.find_by(code: dma["id"])}
    self.designated_market_areas = []
    self.designated_market_areas = dmas.compact if !dmas.blank?

    cities = targeting.select{|geo| geo["type"] == 'City'}.collect{|city| City.find(city["id"])}
    self.cities = []
    self.cities = cities.compact if !cities.blank?

    states = targeting.select{|geo| geo["type"] == 'State'}.collect{|state| State.find(state["id"])}
    self.states = []
    self.states = states.compact if !states.blank?
  end

  def ad_name(start_date, ad_size)
    start_date = Date.parse(start_date) if start_date.is_a?(String)
    quarter = ((start_date.month - 1) / 3) + 1

    "#{ order.io_detail.reach_client.try(:abbr) } #{ order.io_detail.client_advertiser_name } " \
    "Q#{ quarter }#{ start_date.strftime('%y') } " \
    "#{ !targeted_zipcodes.blank? || !designated_market_areas.empty? ? 'GEO ' : ''}" \
    "#{ audience_groups.empty? ? 'RON' : 'BTCT' } " \
    "#{ ad_size }"
  end

  def ad_name(start_date, ad_size)
    start_date = Date.parse(start_date) if start_date.is_a?(String)
    quarter = ((start_date.month - 1) / 3) + 1

    "#{ order.io_detail.reach_client.try(:abbr) } #{ order.io_detail.client_advertiser_name } " \
    "#{ !targeted_zipcodes.blank? || !designated_market_areas.empty? ? 'GEO ' : ''}" \
    "#{ audience_groups.empty? ? 'RON' : 'BT/CT' } " \
    "Q#{ quarter }#{ start_date.strftime('%y') } " \
    "#{ ad_size.gsub(/,/, ' ') }"
  end

  private

    def flight_dates_with_in_order_range
      if(self.start_date.to_date < self.order.start_date.to_date)
        errors.add(:start_date, "can not be before start date of order")
      end

      if self.end_date.to_date > self.order.end_date.to_date
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

      # https://github.com/collectivemedia/reachui/issues/136
      self[:name] = name[0..499] if name
    end

    def move_end_date_time
      self.end_date = self.end_date.end_of_day
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

    def html_unescape(str)
      str.gsub(/&amp;/m, '&').gsub(/&gt;/m, '>').gsub(/&lt;/m, '<').gsub(/&quot;/m, '"').gsub(/&#39;/m, "'")
    end
end
