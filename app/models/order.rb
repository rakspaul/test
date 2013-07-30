class Order < ActiveRecord::Base
  has_paper_trail ignore: [:updated_at]

  belongs_to :advertiser, foreign_key: :network_advertiser_id
  belongs_to :data_source
  belongs_to :network
  belongs_to :user
  belongs_to :sales_person, foreign_key: :sales_person_id, class_name: 'SalesPeople'

  has_one :nielsen_campaign

  has_many :lineitems, -> { order('name') }, inverse_of: :order
  has_many :io_assets
  has_many :ads

  validates :name, :start_date, :end_date, presence: true
  validates :network_advertiser_id, :user_id, :network_id, presence: true, numericality: { only_integer: true}
  validate :validate_start_date, on: :create
  validate :validate_advertiser_id, :validate_network_id, :validate_user_id, :validate_sales_people, :validate_end_date_after_start_date

  before_create :create_random_source_id, :set_data_source, :make_order_inactive

  scope :latest_updated, -> { order("last_modified desc") }

  def self.of_network(network)
    where(:network => network)
  end

  def self.find_by_id_or_source_id(id)
    where("id = :id or source_id = :id_s", id: id, id_s: id.to_s)
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

    def validate_sales_people
      if self.sales_person_id.to_i > 0
        errors.add :sales_person_id, "is invalid" unless SalesPeople.exists?(self.sales_person_id)
      end
    end

    def validate_start_date
      errors.add :start_date, "can not be in past" if self.start_date < Time.zone.now.beginning_of_day
    end

    def validate_end_date_after_start_date
      if(self.start_date >= self.end_date)
        errors.add :end_date, "can not be before start date"
      end
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
end
