class Order < ActiveRecord::Base
  belongs_to :advertiser, foreign_key: :network_advertiser_id
  belongs_to :network

  has_many :lineitems, inverse_of: :order, :order => 'name'

  validates :name, :start_date, :end_date, presence: true
  validates :advertiser_id, :user_id, :network_id, presence: true, numericality: { only_integer: true}
  validate :validate_advertiser_id, :validate_network_id, :validate_user_id, :validate_end_date_after_start_date

  scope :latest_updated, -> { order("last_modified desc") }

  def self.of_network(network)
    where(:network => network)
  end

  def self.find_by_id_or_source_id(id)
    where("id = :id or source_id = :id_s", id: id, id_s: id.to_s)
  end

  private
    def validate_advertiser_id
      errors.add :advertiser_id, "is invalid" unless Advertiser.exist?(self.advertiser_id)
    end

    def validate_networkd_id
      errors.add :network_id, "is invalid" unless Network.exist?(self.network_id)
    end

    def validate_user_id
      errors.add :user_id, "is invalid" unless User.exist?(self.user_id)
    end

    def validate_end_date_after_start_date
      if(self.start_date <= self.end_date)
        errors.add :end_date, "can not be less than or equal to start date"
      end
    end
end
