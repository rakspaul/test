FactoryGirl.define do
  factory :advertiser do
    name "TWCAuto"
    network { FactoryGirl.singleton :network }
    source_id "R_#{SecureRandom.uuid}"
    data_source_id 1
  end

  factory :order do
    name  "Rodenbaugh's on Audience Network / TWCC (10/3 - 12/29/13) - 788977"
    start_date 1.day.from_now
    end_date   22.day.from_now
    network { FactoryGirl.singleton :network }
    advertiser { FactoryGirl.singleton :advertiser }
    user
  end

  factory :order_with_lineitem, :parent => :order do
    after(:create) do |ord|
      create_list(:lineitem_with_ad, order: ord)
    end
  end

  factory :io_detail do
  end

  factory :reach_client do
    id 1
    name "Test Reach Client Name"
    abbr "TRCN"
    network { FactoryGirl.singleton :network }
    user_id { FactoryGirl.singleton(:user).id }
    sales_person    { FactoryGirl.singleton :user }
    account_manager { FactoryGirl.singleton :user }
  end

  factory :lineitem do
    name "Family, Home Owners, Mid HHI ($60k-$150k); Dallas RON"
    start_date 1.day.from_now
    end_date   22.day.from_now
    volume  300_000
    rate  2.22
    value 666.00
    ad_sizes "160x600, 300x250, 728x90"
    alt_ad_id "1"
    targeted_zipcodes "12345, 56789"
    user
  end

  factory :lineitem_with_ad, :parent => :lineitem do
    after(:create) do |li|
      create_list(:ad, lineitem: li)
    end
  end

  factory :ad do
    description "TWC Rodenbaugh's Q413 RON 160x600, 300x250, 728x90"
    ad_type  "Standard"
    size  "160x600"
    rate  2.22
    cost_type "CPM"
    start_date 1.day.from_now
    end_date   22.day.from_now
    alt_ad_id "1"
    keyvalue_targeting "12345, 56789"
    order
    network { FactoryGirl.singleton :network }
  end

  factory :io_asset do
    order
    asset_upload_name "Collective_IO.xlsx"
    asset_path Rails.root.join('spec', 'fixtures', 'io_files', 'Collective_IO.xlsx').to_s
  end

  factory :blocked_advertiser do
    advertiser_id 1
    site_id 1
    state 'BLOCK'
    type 'BlockedAdvertiser'
    network { FactoryGirl.singleton :network }
    user { FactoryGirl.singleton :user }
  end
end
