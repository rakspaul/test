FactoryGirl.define do
  factory :creative do
    name "Test creative"
    size "160x600"
    width 160
    height 600
    redirect_url "http://ad.doubleclick.net/ad/twc.collective;adid=83790015;sz=160x600"
    network { FactoryGirl.singleton :network }
    advertiser { FactoryGirl.singleton :advertiser }
  end

  factory :lineitem_assignment do
    network_id 6
    data_source_id 1
  end

  factory :video_creative do
    name "Test video creative"
    size "350x200"
    width 350
    height 200
    redirect_url "http://ad.doubleclick.net/ad/twc.collective;adid=83790015;sz=160x600"
    network { FactoryGirl.singleton :network }
    advertiser { FactoryGirl.singleton :advertiser }
  end

  factory :video_ad_assignment do
    video_creative
    ad
    network_id 6
    data_source_id 1
  end
end
