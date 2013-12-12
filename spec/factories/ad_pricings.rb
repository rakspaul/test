FactoryGirl.define do
  factory :ad_pricing do
    pricing_type "CPM"
    rate 1
    quantity 1000
    value 1.0
    source_id "12345"
    is_flat_fee false
    network { FactoryGirl.singleton :network }
  end
end
