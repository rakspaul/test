require 'spec_helper'

describe Ad do
  context "flight dates" do
    it "should register error for dates not within lineitem date range" do
      li = Lineitem.new(start_date: (Time.current + 5.day), end_date: (Time.current + 12.days))
      ad = Ad.new(lineitem: li, start_date: (li.start_date - 3.days), end_date: (li.end_date - 2.days))

      ad.send(:check_flight_dates_within_li_flight_dates)

      ad.errors[:start_date].should be
      ad.errors[:end_date].should be
    end

    it "should not register error for dates within lineitem date range" do
      li = Lineitem.new(start_date: (Time.current + 5.day), end_date: (Time.current + 12.days))
      ad = Ad.new(lineitem: li, start_date: (li.start_date + 1.days), end_date: (li.end_date - 2.days))

      ad.send(:check_flight_dates_within_li_flight_dates)

      ad.errors.messages.should == {}
    end
  end

  describe 'before_validation' do
    it 'should run proper callbacks' do
      li = mock_model(Lineitem)
      network = mock_model(Network)
      ad = Ad.new(description: 'test ad', lineitem: li, network: network)

      ad.should_receive(:check_flight_dates_within_li_flight_dates)

      ad.run_callbacks(:validation) { false }
    end
  end

  describe 'before_save' do
    it 'should run proper callbacks' do
      li = mock_model(Lineitem)
      network = mock_model(Network)
      ad = Ad.new(lineitem: li, network: network, end_date: DateTime.now)

      ad.should_receive(:move_end_date_time)
      ad.should_receive(:set_data_source)
      ad.should_receive(:set_type_params)
      ad.should_receive(:set_default_status)

      ad.run_callbacks(:save) { false }
    end
  end

  context "media types" do
    let(:ad) { Ad.new(lineitem: Lineitem.new) }
    let(:lineitem_video) { Lineitem.new(type: 'Video') }
    let(:display_type) { FactoryGirl.build(:display_media_type) }
    let(:video_type)    { FactoryGirl.build(:video_media_type) }
    let(:mobile_type)   { FactoryGirl.build(:mobile_media_type) }
    let(:facebook_type) { FactoryGirl.build(:facebook_media_type) }

    it "set display ad type" do
      ad.media_type = display_type
      ad.send :set_type_params
      expect(ad.ad_type).to eq(Display::AD_TYPE)
    end

    it "set display priority" do
      ad.media_type = display_type
      ad.send :set_type_params
      expect(ad.priority).to eq(Display::PRIORITY)
    end

    it "set display high priority" do
      ad.media_type = display_type
      ad.audience_groups << AudienceGroup.new
      ad.send :set_type_params
      expect(ad.priority).to eq(Display::HIGH_PRIORITY)
    end

    it "set video ad type" do
      ad.media_type = video_type
      ad.send :set_type_params
      expect(ad.ad_type).to eq(Video::AD_TYPE)
    end

    it "set video priority" do
      ad.media_type = video_type
      ad.send :set_type_params
      expect(ad.priority).to eq(Video::PRIORITY)
    end

    it "set companion ad type" do
      ad.lineitem = lineitem_video
      ad.media_type = display_type
      ad.send :set_type_params
      expect(ad.ad_type).to eq(Video::COMPANION_AD_TYPE)
    end

    it "set companion priority" do
      ad.lineitem = lineitem_video
      ad.media_type = display_type
      ad.send :set_type_params
      expect(ad.priority).to eq(Video::COMPANION_PRIORITY)
    end

    it "set facebook ad type" do
      ad.media_type = facebook_type
      ad.send :set_type_params
      expect(ad.ad_type).to eq(Facebook::AD_TYPE)
    end

    it "set facebook priority" do
      ad.media_type = facebook_type
      ad.send :set_type_params
      expect(ad.priority).to eq(Facebook::PRIORITY)
    end

    it "set mobile ad type" do
      ad.media_type = mobile_type
      ad.send :set_type_params
      expect(ad.ad_type).to eq(Mobile::AD_TYPE)
    end

    it "set mobile priority" do
      ad.media_type = mobile_type
      ad.send :set_type_params
      expect(ad.priority).to eq(Mobile::PRIORITY)
    end
  end

  context "destroy" do
    let(:ad) { FactoryGirl.create :ad }
    let!(:frequency_cap) { FactoryGirl.create :frequency_cap, ad: ad }

    it "should delete related frequency caps" do
      expect { ad.destroy }.to change(FrequencyCap, :count).by(-1)
    end
  end
end
