class Order < ActiveRecord::Base

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
  has_many :order_notes
  has_many :io_logs

  validates :start_date, :end_date, presence: true
  validates :network_advertiser_id, :user_id, :network_id, presence: true, numericality: { only_integer: true}
  validate :validate_start_date, on: :create
  validates :name, uniqueness: { message: "The order name is already used.", scope: :network_id }, presence: true
  validate :validate_advertiser_id, :validate_network_id, :validate_user_id, :validate_end_date_after_start_date

  before_create :create_random_source_id, :make_order_inactive
  before_destroy :check_could_be_deleted
  before_save :move_end_date_time, :set_data_source

  scope :latest_updated, -> { order("last_modified desc") }
  scope :filterByStatus, lambda { |status| where("io_details.state = '#{status}'") unless status.blank? }
  scope :filterByAM, lambda { |am| where("io_details.account_manager_id = '#{am}'") unless am.blank? }
  scope :filterByTrafficker, lambda { |trafficker| where("io_details.trafficking_contact_id = '#{trafficker}'") unless trafficker.blank? }
  scope :filterByLoggingUser, lambda { |user, orders_by_user| where("user_id = '#{user.id}'") unless orders_by_user.blank? || orders_by_user == "all_orders" }
  scope :filterByIdOrNameOrAdvertiser, lambda {|query| where("orders.id::text ILIKE ? or name ILIKE ? or source_id ILIKE ? or io_details.client_advertiser_name ILIKE ?",
                                                             "%#{query}%", "%#{query}%","%#{query}%","%#{query}%") unless query.blank? }

  def self.of_network(network)
    where(:network => network)
  end

  def self.find_by_id_or_source_id(id)
    where("id = :id or source_id = :id_s", id: id, id_s: id.to_s)
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
    "#{ network.try(:dfp_url) }/OrderDetail/orderId=#{ source_id }"
  end

  def pushed_to_dfp?
    self.source_id.to_i != 0
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
      errors.add :start_date, "start date cannot be in the past" if self.start_date < Time.zone.now.beginning_of_day
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
end
