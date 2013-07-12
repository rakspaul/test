class NielsenCampaign < ActiveRecord::Base
  GENDER = %w(male female both)
  VALID_START_AGE = %w(2 18 25 35 45 55 65)
  VALID_END_AGE = %w(PLUS 24 34 44 54 64)
  COST_TYPES = %w(imps cpp)
  AGE_RANGES = %w(2-PLUS 18-24 18-34 18-44 18-54 25-34 25-44 25-54 25-64 35-44 35-54 35-64 45-54 45-64 55-64 65-PLUS)
  belongs_to :order
  belongs_to :user

  validates :name, :target_gender, :start_age, :end_age, :cost_type, :value, :order, :user, presence: true
  validates :target_gender, inclusion: { in: GENDER }
  validates :start_age, inclusion: { in: VALID_START_AGE }
  validates :end_age, inclusion: { in: VALID_END_AGE }
  validates :cost_type, inclusion: {in: COST_TYPES }
  validates :age_range, inclusion: {in: AGE_RANGES }
  def age_range
    "#{start_age}-#{end_age}"
  end

  def age_range=(range)
    self.start_age, self.end_age = range.split('-')
  end
end
