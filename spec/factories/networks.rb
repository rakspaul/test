FactoryGirl.define do
  factory :data_source do
    name "Doubleclick"
    ident "dart"
  end

  factory :network do
    id 81
    name "Test network"
    data_source
    media_types { [ FactoryGirl.create(:display_media_type),
                    FactoryGirl.create(:video_media_type),
                    FactoryGirl.create(:mobile_media_type),
                    FactoryGirl.create(:facebook_media_type) ] }
  end

  factory :ad_size do
    network { FactoryGirl.singleton :network }
  end

  factory :media_type do
    network { FactoryGirl.singleton :network }
  end

  factory :display_media_type, :parent => :media_type do
    category 'Display'
  end

  factory :video_media_type, :parent => :media_type do
    category 'Video'
  end

  factory :mobile_media_type, :parent => :media_type do
    category 'Mobile'
  end

  factory :facebook_media_type, :parent => :media_type do
    category 'Facebook'
  end

  factory :ad_size_160x600, :parent => :ad_size do
    size '160x600'
    width  160
    height 600
  end

  factory :ad_size_300x250, :parent => :ad_size do
    size '300x250'
    width  300
    height 250
  end

  factory :ad_size_728x90, :parent => :ad_size do
    size '728x90'
    width  728
    height 90
  end

  factory :ad_size_1x1, :parent => :ad_size do
    size '1x1'
    width  1
    height 1
  end

end
