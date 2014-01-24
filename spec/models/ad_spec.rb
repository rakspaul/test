require 'spec_helper'

describe Ad do
  let(:user) { FactoryGirl.create :user }
  let(:advertiser) { FactoryGirl.create :advertiser }

  context "wrong flight dates" do
    before do
      @order = Order.create user_id: user.id, network: user.network, network_advertiser_id: advertiser.id, start_date: (Time.current + 1.day), end_date: (Time.current + 12.days), name: "Rodenbaugh's on Audience Network / TWCC (10/3 - 12/29/13) - 788977"
      @order.errors.messages.should == {}

      AdSize.create size: "160x600", width: 160, height: 600, network: @order.network
      AdSize.create size: "300x250", width: 300, height: 250, network: @order.network
      AdSize.create size: "728x90", width: 728, height: 90, network: @order.network

      @li = Lineitem.create order_id: @order.id, user_id: user.id, start_date: (Time.current + 5.day), end_date: (Time.current + 12.days), name: "Family, Home Owners, Mid HHI ($60k-$150k); Dallas RON", volume: 300_000, rate: 2.22, value: 666.00, ad_sizes: "160x600, 300x250, 728x90"
      @li.errors.messages.should == {}
    end
  
    it "start/end date should be within lineitem start/end date range" do
      ad = Ad.new order_id: @order.id, io_lineitem_id: @li.id, size: "160x600", start_date: (@li.start_date - 3.days), end_date: (@li.end_date - 2.days), description: "Test description"

      ad.valid?.should == false

      ad.errors[:start_date].should be
      ad.errors[:end_date].should be

      ad.start_date = Time.current + 6.days
      ad.end_date = Time.current + 8.days
      ad.valid?.should be
      ad.errors.messages.should == {}
    end
  end

  context "media type" do
    let(:order) { FactoryGirl.create(:order) }
    let(:lineitem) { FactoryGirl.create(:lineitem, :order => order) }
    let(:lineitem_video) { FactoryGirl.create(:lineitem_video, :order => order) }
    let!(:ad_sizes) { [ FactoryGirl.create(:ad_size_1x1),
                        FactoryGirl.create(:ad_size_160x600),
                        FactoryGirl.create(:ad_size_300x250),
                        FactoryGirl.create(:ad_size_728x90) ] }

    let(:network) { FactoryGirl.singleton(:network) }
    let(:display_type)  { FactoryGirl.create(:display_media_type) }
    let(:video_type)    { FactoryGirl.create(:video_media_type) }
    let(:mobile_type)   { FactoryGirl.create(:mobile_media_type) }
    let(:facebook_type) { FactoryGirl.create(:facebook_media_type) }
    let!(:segment1) { FactoryGirl.create(:segment1) }
    let!(:segment2) { FactoryGirl.create(:segment2) }
    let!(:context1) { FactoryGirl.create(:context1) }
    let!(:context2) { FactoryGirl.create(:context2) }
    let(:audience_group) { FactoryGirl.create(:audience_group) }

    let(:ad) { Ad.new order: order,
                      lineitem: lineitem,
                      size: "160x600",
                      network: network,
                      start_date: lineitem.start_date,
                      end_date:   lineitem.end_date,
                      description: "Test description" }

    it "set display ad type" do
      ad.media_type = display_type
      ad.save
      expect(ad.ad_type).to eq(Display::AD_TYPE)
    end

    it "set display priority" do
      ad.media_type = display_type
      ad.save
      expect(ad.priority).to eq(Display::PRIORITY)
    end

    it "set display high priority" do
      ad.media_type = display_type
      ad.audience_groups << audience_group
      ad.save
      expect(ad.priority).to eq(Display::HIGH_PRIORITY)
    end

    it "set video ad type" do
      ad.media_type = video_type
      ad.save
      expect(ad.ad_type).to eq(Video::AD_TYPE)
    end

    it "set video priority" do
      ad.media_type = video_type
      ad.save
      expect(ad.priority).to eq(Video::PRIORITY)
    end

    it "set companion ad type" do
      ad.lineitem = lineitem_video
      ad.media_type = display_type
      ad.save
      expect(ad.ad_type).to eq(Video::COMPANION_AD_TYPE)
    end

    it "set companion priority" do
      ad.lineitem = lineitem_video
      ad.media_type = display_type
      ad.save
      expect(ad.priority).to eq(Video::COMPANION_PRIORITY)
    end

    it "set facebook ad type" do
      ad.media_type = facebook_type
      ad.save
      expect(ad.ad_type).to eq(Facebook::AD_TYPE)
    end

    it "set facebook priority" do
      ad.media_type = facebook_type
      ad.save
      expect(ad.priority).to eq(Facebook::PRIORITY)
    end

    it "set mobile ad type" do
      ad.media_type = mobile_type
      ad.save
      expect(ad.ad_type).to eq(Mobile::AD_TYPE)
    end

    it "set mobile priority" do
      ad.media_type = mobile_type
      ad.save
      expect(ad.priority).to eq(Mobile::PRIORITY)
    end
  end
end
