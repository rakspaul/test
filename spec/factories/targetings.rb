FactoryGirl.define do
  factory :frequency_cap do
    ad
    cap_value  100
    time_value 24
    time_unit  FrequencyCap::HOURS
  end

  factory :li_frequency_cap, :class => LineitemFrequencyCap do
    lineitem
    cap_value  100
    time_value 24
    time_unit  FrequencyCap::HOURS
  end
end
