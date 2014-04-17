require 'spec_helper'

describe AdAssignment do
  let(:order) { FactoryGirl.create(:order, name: 'AdAssignment test order') }
  let(:lineitem) { FactoryGirl.create(:lineitem, order: order) }
  let(:media_type) { FactoryGirl.singleton :display_media_type }
  let!(:ad_sizes) { [ FactoryGirl.create(:ad_size_1x1),
                      FactoryGirl.create(:ad_size_160x600),
                      FactoryGirl.create(:ad_size_300x250),
                      FactoryGirl.create(:ad_size_728x90) ] }
  it { should belong_to (:ad) }
  it { should belong_to (:creative) }
  it { should belong_to (:data_source) }
  it { should belong_to (:network) }

  describe "validations" do
    before do
      ad = FactoryGirl.build(:ad, lineitem: lineitem, start_date: 1.day.from_now, end_date: 10.day.from_now, media_type: media_type)
      creative = FactoryGirl.build(:creative)
      @ad_assignment = AdAssignment.new(ad: ad, creative: creative, start_date: 1.day.from_now, end_date: 10.day.from_now)
    end

    it "should check end date after start date" do
      @ad_assignment.start_date = 2.day.from_now
      @ad_assignment.end_date = 1.day.from_now
      @ad_assignment.valid?
      @ad_assignment.errors.messages[:end_date].should include "couldn't be before start date"
    end

    describe "check fight dates within ad dates" do
      it "should check start date not before ad start date" do
        @ad_assignment.start_date = Time.now
        @ad_assignment.valid?
        @ad_assignment.errors.messages[:start_date].should include "couldn't be before ad's start date"
      end

      it "should check end date not after ad end date" do
        @ad_assignment.end_date = 11.day.from_now
        @ad_assignment.valid?
        @ad_assignment.errors.messages[:end_date].should include "couldn't be after ad's end date"
      end
    end
  end

  it "should assign network data source" do
    ad = FactoryGirl.create(:ad, lineitem: lineitem, start_date: 1.day.from_now, end_date: 10.day.from_now)
    creative = FactoryGirl.create(:creative)
    ad_assignment = AdAssignment.create(ad: ad, creative: creative, network: ad.network, start_date: 1.day.from_now, end_date: 10.day.from_now)
    ad_assignment.data_source.should == ad.network.data_source
  end
end
