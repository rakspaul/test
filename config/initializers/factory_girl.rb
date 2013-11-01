module FactoryGirl
  @@singletons = {}

  def self.singleton(factory_key)
    begin
      @@singletons[factory_key] = FactoryGirl.create(factory_key)
    rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique
      # already in DB so return nil
    end

    return @@singletons[factory_key]
  end
end
