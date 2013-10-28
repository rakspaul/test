FactoryGirl.define do
  factory :data_source do
    name "Doubleclick"
    ident "dart"
  end

  factory :network do
    id 81
    name "Test network"
    data_source
  end
end
