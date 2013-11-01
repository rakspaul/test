FactoryGirl.define do
  factory :advertiser do
    name "TWCAuto"
    network { FactoryGirl.singleton :network }
    source_id "R_#{SecureRandom.uuid}"
    data_source_id 1
  end

  factory :order do
    name  "Rodenbaugh's on Audience Network / TWCC (10/3 - 12/29/13) - 788977" 
    start_date (Time.current + 1.day)
    end_date (Time.current + 22.days)
    network { FactoryGirl.singleton :network }
  end

  factory :order_with_lineitem, :parent => :order do
    lineitem { FactoryGirl.create(:lineitem_with_ad) }
  end
        
  factory :io_detail do
  end
            
  factory :reach_client do
    name "Test Reach Client Name"
    abbr "TRCN"
    network { FactoryGirl.singleton :network }
  end
                            
  factory :lineitem do
    name "Family, Home Owners, Mid HHI ($60k-$150k); Dallas RON"
    start_date (Time.current + 1.day)
    end_date (Time.current + 22.days)
    volume  300_000
    rate  2.22
    value 666.00
    ad_sizes "160x600, 300x250, 728x90"
    alt_ad_id "1"
    targeted_zipcodes "12345, 56789" 
  end

  factory :lineitem_with_ad, :parent => :lineitem do
    ad { FactoryGirl.create(:ad) }
  end

  factory :ad do
    description "TWC Rodenbaugh's Q413 RON 160x600, 300x250, 728x90"
    ad_type  "Standard"
    size  "160x600"
    rate  2.22
    cost_type "CPM"
    start_date (Time.current - 1.day)
    end_date (Time.current + 2.days)
    alt_ad_id "1"
    keyvalue_targeting "12345, 56789" 
  end
end
