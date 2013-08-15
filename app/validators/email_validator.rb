class EmailValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    if value !~ /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/
      record.errors.add attribute, "#{value} not valid."
    end
  end
end
