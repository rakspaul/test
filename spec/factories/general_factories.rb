FactoryGirl.define do
  factory :advertiser do
    name "TWCAuto"
    network { FactoryGirl.singleton :network }
    source_id "R_#{SecureRandom.uuid}"
    data_source { DataSource.first || FactoryGirl.singleton(:data_source) }
    advertiser_type { FactoryGirl.singleton :advertiser_type }
  end

  factory :dfp_pulled_order, :class => "Order" do
    name  "Rodenbaugh's on Audience Network / TWCC"
    start_date 1.day.from_now
    end_date   22.day.from_now
    network { FactoryGirl.singleton :network }
    advertiser { FactoryGirl.singleton :advertiser }
    user
  end

  factory :order do
    sequence(:name) { |n| "Rodenbaugh's on Audience Network / TWCC (10/3 - 12/29/13) - 788977 #{n}" }
    start_date 1.day.from_now
    end_date   22.day.from_now
    network { FactoryGirl.singleton :network }
    advertiser { FactoryGirl.singleton :advertiser }
    user
    after(:create) do |ord|
      create_list(:io_detail, 1, order: ord)
      create_list(:io_asset, 1, order: ord)
    end
  end

  factory :order_with_lineitem, :parent => :order do
    after(:create) do |ord|
      create_list(:lineitem_with_ad, 1, order: ord)
      create_list(:io_asset, 1, order: ord)
    end
  end

  factory :io_detail do
    state 'draft'
    client_advertiser_name { FactoryGirl.singleton(:advertiser).name }
    order_id  { FactoryGirl.singleton(:order).id }
    media_contact_id  { FactoryGirl.singleton(:media_contact).id }
    billing_contact_id { FactoryGirl.singleton(:billing_contact).id }
    account_manager_id { FactoryGirl.create(:user).id }
    sales_person_id { FactoryGirl.create(:user).id }
    trafficking_contact_id { FactoryGirl.create(:user).id }
    reach_client { FactoryGirl.singleton :reach_client }
  end

  factory :reach_client do
    name "Test Reach Client Name"
    abbr "TRCN"
    network { FactoryGirl.singleton :network }
    user_id { FactoryGirl.singleton(:user).id }
    sales_person    { FactoryGirl.singleton :user }
    account_manager { FactoryGirl.singleton :user }
    agency { FactoryGirl.singleton(:agency) }
    client_buffer 5.5
  end

  factory :contact do
    sequence(:email) { |n| "test#{n}@twcable.com" }
    phone '888-555-5555'
    reach_client_id 1
  end

  factory :media_contact, :parent => :contact, :class => 'MediaContact' do
    name "Marsha Lowe"
  end

  factory :billing_contact, :parent => :contact, :class => 'BillingContact' do
    name "Addy Earles"
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
    type "Display"
    media_type
    user
    proposal_li_id "#{SecureRandom.random_number(10000)}"
    before(:create) do |li|
      FactoryGirl.singleton :network
    end
  end

  factory :lineitem_video, :parent => :lineitem, :class => 'Video' do
    name "Family, Home Owners, Mid HHI ($60k-$150k); Dallas RON; Video"
    ad_sizes ""
    media_type { FactoryGirl.singleton :video_media_type }
    type "Video"
  end

  factory :lineitem_with_ad, :parent => :lineitem do
    after(:create) do |li|
      create_list(:ad, 1, lineitem: li)
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
    media_type { MediaType.first || FactoryGirl.singleton(:display_media_type) }
  end

  factory :ad_assignment do
    ad
    creative
    start_date Time.now
    end_date (Time.now + 5.days)
    network_id 6
    data_source_id 1
  end

  factory :io_asset do
    order
    asset_type "io"
    asset_upload_name "Collective_IO.xlsx"
    asset_path Rails.root.join('spec', 'fixtures', 'io_files', 'Collective_IO.xlsx').to_s
  end

  factory :blocked_advertiser do
    advertiser_id 1
    site_id 1
    state 'BLOCK'
    type 'BlockedAdvertiser'
    network { FactoryGirl.singleton :network }
  end

  factory :blocked_advertiser_group do
    advertiser_group_id 1
    site_id 1
    state 'BLOCK'
    type 'BlockedAdvertiserGroup'
    network { FactoryGirl.singleton :network }
  end

  factory :site do
    name "WRAL"
    source_id 1
    network { FactoryGirl.singleton :network }
  end

  factory :advertiser_block do
    name "CPG"
    network { FactoryGirl.singleton :network }
  end

  factory :default_site_blocks do
    network { FactoryGirl.singleton :network }
  end

  factory :advertiser_type do
    name "ADVERTISER"
    network { FactoryGirl.singleton :network }
  end

  factory :audience_group do
    name "Auto"
    key_values "btg=cm.auto_h,btg=cm.auto_l,contx=adult,contx=auto"
    network { FactoryGirl.singleton :network }
    user
  end

  factory :segment do
    network { FactoryGirl.singleton :network }
  end

  factory :segment1, :parent => :segment do
    name "cm.auto_h"
  end

  factory :segment2, :parent => :segment do
    name "cm.auto_l"
  end

  factory :context do
    network { FactoryGirl.singleton :network }
  end

  factory :context1, :parent => :context do
    name "cm.auto"
  end

  factory :context2, :parent => :context do
    name "cm.adult"
  end

  factory :geo_target do
    country_code "US"
    targetable true
  end

  factory :city, :class => GeoTarget::City, :parent => :geo_target do
    name "New York"
    source_id        1023191
    source_parent_id 21167
    state
  end

  factory :country, :class => GeoTarget::Country, :parent => :geo_target  do
    name "United States"
    source_id 2840
  end

  factory :state, :class => GeoTarget::State, :parent => :geo_target  do
    name "New York"
    source_id 21167
    country
  end

  factory :designated_market_area, :class => GeoTarget::DesignatedMarketArea, :parent => :geo_target do
    id 541
    source_id 1015412
    name "Lexington"
  end

  factory :block_log do
    action "Block"
    status "Pending"
    message "test message"
    site
    advertiser { FactoryGirl.singleton(:advertiser) }
    advertiser_group_id { FactoryGirl.singleton(:advertiser_block).id }
    user
    created_at 1.day.from_now
    updated_at 1.day.from_now
  end

  factory :agency do
    name "Agency"
    source_id "R_#{SecureRandom.uuid}"
    network { FactoryGirl.singleton :network }
  end

  factory :role do
    name "reach_ui"
  end

  factory :platform do
    name "Test Platform Name"
    dfp_key "vid"
    naming_convention "ADP"
    ad_type "STANDARD"
    priority 8
    enabled true
    media_type
    site { FactoryGirl.singleton :site }
    network { FactoryGirl.singleton :network }
    dfp_site_name "WRAL"
  end

end
