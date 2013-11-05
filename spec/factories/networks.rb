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

  factory :ad_size_160x600 do
    network { FactoryGirl.singleton :network }
    size '160x600'
    width  160
    height 600
  end

  factory :ad_size_300x250 do
    network { FactoryGirl.singleton :network }
    size '300x250'
    width  300
    height 250
  end

  factory :ad_size_728x90 do
    network { FactoryGirl.singleton :network }
    size '728x90'
    width  728
    height 90
  end

end
