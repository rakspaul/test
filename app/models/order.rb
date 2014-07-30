class Order < ActiveRecord::Base
  cattr_accessor :current_user

  has_paper_trail ignore: [:updated_at]

  belongs_to :advertiser, foreign_key: :network_advertiser_id
  belongs_to :data_source
  belongs_to :network
  belongs_to :user
  belongs_to :sales_person, foreign_key: :sales_person_id, class_name: 'SalesPeople'

  has_one :nielsen_campaign, dependent: :destroy
  has_one :io_detail, dependent: :destroy

  has_many :lineitems, -> { order('name') }, inverse_of: :order, dependent: :destroy
  has_many :io_assets, dependent: :destroy
  has_many :ads, dependent: :destroy
  has_many :order_notes, -> { order('created_at desc') }
  has_many :io_logs

  validates :start_date, :end_date, presence: true
  validates :network_advertiser_id, :user_id, :network_id, presence: true, numericality: { only_integer: true}
  validates :name, uniqueness: { case_sensitive: false, message: "The order name is already used.", scope: :network_id }, presence: true
  validate :validate_start_date, on: :create
  validate :validate_advertiser_id, :validate_network_id, :validate_user_id, :validate_end_date_after_start_date

  before_create :create_random_source_id, :make_order_inactive, :set_est_flight_dates
  before_destroy :check_could_be_deleted
  before_save :move_end_date_time, :set_data_source
  after_update :set_push_note
  before_update :check_est_flight_dates

  scope :of_network, -> (network) { where(network: network) }
  scope :by_status, -> (status) { where("io_details.state = '#{status}'") }
  scope :by_account_manager, -> (am) { where("io_details.account_manager_id = ?", am) }
  scope :by_trafficker, -> (trafficker) { where("io_details.trafficking_contact_id = ?", trafficker) }
  scope :by_reach_client, -> (client) { where("io_details.reach_client_id = ?", rc) }
  scope :by_search_term, -> (term) { where("orders.name ilike :q or io_details.client_advertiser_name ilike :q", q: "%#{term}%") }
  scope :by_user, ->(user) { where("io_details.account_manager_id = :id OR io_details.trafficking_contact_id = :id", id: user.id) }
  scope :by_reach_client, ->(reach_client) { where("io_details.reach_client_id = ?", reach_client) }
  scope :latest_updated, -> { order("last_modified desc") }

  def self.find_by_id_or_source_id(id)
    where("orders.id = :id or orders.source_id = :id_s", id: id, id_s: id.to_s)
  end

  def self.by_search_query(term)
    id = Integer(term) rescue 0

    # assume that number above 4 digit is search on 'id' or 'source id'
    if id > 9999
      find_by_id_or_source_id(id)
    else
      where("orders.name ilike :q or
        io_details.client_advertiser_name ilike :q", q: "%#{term}%"
      )
    end
  end

  def self.by_user(user)
    where("io_details.account_manager_id = '#{user.id}' OR io_details.trafficking_contact_id = '#{user.id}'")
  end

  def self.by_agency(agency)
    where("io_details.reach_client_id IN (?)", agency.try(:reach_clients).pluck(:id))
  end

  def total_impressions
    self.lineitems.inject(0){|sum, li| sum += li.volume.to_i }
  end

  def total_cpm
    self.lineitems.inject(0.0){|sum, li| sum += li.rate.to_f }
  end

  def total_media_cost
    self.lineitems.inject(0.0){|sum, li| sum += li.value.to_f }
  end

  def dfp_url
    "#{network.try(:dfp_url)}/OrderDetail/orderId=#{source_id}"
  end

  def pushed_to_dfp?
    self.source_id.to_i != 0
  end

  def latest_import_or_push_note
    self.order_notes.find {|note| ['Imported Order', 'Pushed Order'].include?(note.note) }
  end

  def set_import_note
    if !self.order_notes.detect{|n| n.note == "Imported Order"}
      self.order_notes.create note: "Imported Order", user: current_user, order: self
    end
  end

  def set_upload_note
    self.order_notes.create note: "Uploaded Order", user: current_user, order: self
  end

  # temporary fix [https://github.com/collectivemedia/reachui/issues/814]
  def start_date
    read_attribute_before_type_cast('start_date').try(:to_date)
  rescue ArgumentError => e
    nil
  end

  def end_date
    read_attribute_before_type_cast('end_date').try(:to_date)
  rescue ArgumentError => e
    nil
  end

  private
    def validate_advertiser_id
      errors.add :network_advertiser_id, "is invalid" unless Advertiser.exists?(self.network_advertiser_id)
    end

    def validate_network_id
      errors.add :network_id, "is invalid" unless Network.exists?(self.network_id)
    end

    def validate_user_id
      errors.add :user_id, "is invalid" unless User.exists?(self.user_id)
    end

    def validate_start_date
      errors.add :start_date, "start date cannot be in the past" if self.start_date < Time.zone.now.to_date
    end

    def validate_end_date_after_start_date
      if(self.start_date >= self.end_date)
        errors.add :end_date, "can not be before start date"
      end
    end

    def move_end_date_time
      self.end_date = self.end_date.end_of_day
    end

    def create_random_source_id
      self.source_id = "R_#{SecureRandom.uuid}"
    end

    def set_data_source
      self.data_source = self.network.data_source
    end

    def make_order_inactive
      self.active = false
      true
    end

    # order could not be deleted after it was pushed to DFP
    def check_could_be_deleted
      pushed_to_dfp? ? false : true
    end

    def set_push_note
      if self.io_detail.try(:state) == 'pushing'
        self.order_notes.create note: "Pushed Order", user: current_user, order: self
      end
    end

    # temporary fix [https://github.com/collectivemedia/reachui/issues/814]
    def set_est_flight_dates
      start_date = read_attribute_before_type_cast('start_date').to_date
      current = "%.2i:%.2i:%.2i" % [Time.current.hour, Time.current.min, Time.current.sec]
      start_time = start_date.today? ? current : "00:00:00"

      self[:start_date] = "#{start_date} #{start_time}"
      self[:end_date] = read_attribute_before_type_cast('end_date').to_date.to_s+" 23:59:59"
    end

    def check_est_flight_dates
      if start_date_changed?
        start_date, _ = read_attribute_before_type_cast('start_date').to_s.split(' ')
        _, start_time_was = start_date_was.to_s(:db).split(' ')
        self[:start_date] = "#{start_date} #{start_time_was}"
      end
      if end_date_changed?
        end_date, end_time = read_attribute_before_type_cast('end_date').to_s.split(' ')
        _, end_time_was = end_date_was.to_s(:db).split(' ')
        self[:end_date] = "#{end_date} #{end_time_was.nil? ? end_time : end_time_was}"
      end
    end
end
