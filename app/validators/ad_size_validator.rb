class AdSizeValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    unless attribute.nil?
      assignedAdSizes = value.split(',').map(&:strip)
      validAdSizes = AdSize.where(:size => assignedAdSizes).pluck('size')

      invalidAdSizes = assignedAdSizes - validAdSizes
      record.errors.add attribute, "#{invalidAdSizes.join(',')} not found." unless invalidAdSizes.empty?
    end
  end
end
