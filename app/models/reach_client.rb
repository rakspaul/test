class ReachClient < ActiveRecord::Base

  belongs_to :network
  belongs_to :media_contact, :foreign_key => 'media_contact_id'
  belongs_to :billing_contact, :foreign_key => 'billing_contact_id'

  belongs_to :sales_person, :foreign_key => 'sales_person_id', :class_name => "User"
  belongs_to :account_manager, :foreign_key => 'account_manager_id', :class_name => "User"
  belongs_to :agency, :foreign_key => 'agency_id'

  validates :name, :abbr, presence: true, uniqueness: { case_sensitive: false, scope: :network_id }

  validates :network_id, :user_id, :agency_id, presence: true, numericality: { only_integer: true }

  validates :media_contact_id, :billing_contact_id, presence: true, numericality: { only_integer: true }, on: :update

  validates :client_buffer, presence: true, numericality: true

  validate :validate_network_id, :validate_user_id, :validate_sales_person, :validate_account_manager, :validate_sales_person_account_manager, :validate_agency

  validates :client_network_id, numericality: { only_integer: true }

  before_validation :compact_attr

  before_save :client_buffer_val

  def validate_network_id
    errors.add :network_id, "is invalid" unless Network.exists?(self.network_id)
  end

  def validate_user_id
    errors.add :user_id, "is invalid" unless User.exists?(self.user_id)
  end

  def validate_sales_person
    errors.add :sales_person_id, "not selected" unless User.exists?(self.sales_person_id)
  end

  def validate_account_manager
    errors.add :account_manager_id, "not selected" unless User.exists?(self.account_manager_id)
  end

  def validate_sales_person_account_manager
    if !sales_person_id.nil? && !account_manager_id.nil?
      sales_person = Network.find(self.network_id).users.exists?(sales_person_id)
      account_manager = Network.find(self.network_id).users.exists?(account_manager_id)

      errors.add :error, "sales person, account manager must belong to same network" unless sales_person && account_manager
    end
  end

  def validate_agency
    errors.add :agency_id, "not selected" unless Agency.exists?(self.agency_id)
  end

  def self.of_network(network)
    where(network: network)
  end

  def self.names(network)
    of_network(network).select(:name).distinct.order("name asc")
  end

  private
    def compact_attr
      self.name.try(:strip!)
      self.abbr.try(:strip!)
    end

    def client_buffer_val
      val = self.client_buffer
      self.client_buffer = round_decimals(val, 1)
    end

    def round_decimals(val, exp = 0)
      multiplier = 10 ** exp
      return ((val * multiplier).floor).to_f/multiplier.to_f
    end
end
