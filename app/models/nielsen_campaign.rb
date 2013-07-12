class NielsenCampaign < ActiveRecord::Base
  GENDER = %w(male female both)
  VALID_START_AGE = %w(2 18 25 35 45 55 65)
  VALID_END_AGE = %w(PLUS 24 34 44 54 64)

  belongs_to :order
  belongs_to :user

  validates :name, :target_gender, :start_age, :end_age, :order, :user, presence: true
  validates :target_gender, inclusion: { in: GENDER }
  validates :start_age, inclusion: { in: VALID_START_AGE }
  validates :end_age, inclusion: { in: VALID_END_AGE }
end
