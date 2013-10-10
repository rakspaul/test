ActiveRecord::Base.class_eval do
  def self.validates_dates_range(*attr_names)
    # Set the default configuration
    configuration = { :after => Time.now }
   
    # Update defaults with any supplied configuration values
    configuration.update(attr_names.extract_options!)
   
    # Validate each attribute, passing in the configuration
    validates_each(attr_names, configuration) do |record, attr_name, value|
      unless value.nil?
        if configuration[:after].is_a?(Time)
          after_date = configuration[:after]
        else
          after_date = record.send(configuration[:after])
        end

        unless after_date.nil?
          record.errors.add(attr_name, 'can not be before start date') if value < after_date
        end
      end
    end
  end
end
