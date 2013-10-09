class FutureDateValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    record.errors.add attribute, "start date cannot be in the past" if value < Time.zone.now.beginning_of_day
  end
end
