require 'spec_helper'

describe Advertiser do
  it { should belong_to(:data_source) }
  it { should belong_to(:network) }
  it { should belong_to(:advertiser_type) }

  it { should have_many(:orders).with_foreign_key(:network_advertiser_id) }
  it { should have_many(:creatives).with_foreign_key(:network_advertiser_id) }

  describe "default scope" do
    let(:advertiser_type) { FactoryGirl.create(:advertiser_type) }

    before do
      house_advertiser_type = FactoryGirl.create(:advertiser_type, name: 'HOUSEADVERTISER')
      agency_type = FactoryGirl.create(:advertiser_type, name: 'AGENCY')

      advertiser = FactoryGirl.create(:advertiser, advertiser_type: advertiser_type)
      house_advertiser = FactoryGirl.create(:advertiser, advertiser_type: house_advertiser_type)
      agency = FactoryGirl.create(:advertiser, advertiser_type: agency_type)
    end

    it "should only return advertisers of type ADVERTISER" do
      adv = Advertiser.all
      adv.size.should == 1
      adv.first.advertiser_type.should == advertiser_type
    end
  end

  describe "callbacks" do
    let(:advertiser) { FactoryGirl.create(:advertiser) }

    it "should generate random source_id" do
      advertiser.source_id.should match /R\_.+/
    end

    it "should assign network data source" do
      advertiser.data_source.should == advertiser.network.data_source
    end

    it "should set advertiser active" do
      advertiser.active.should be_true
    end
  end

  context "search either by name, id and source_id" do
    before do
      @advertiser_one = FactoryGirl.create :advertiser, name: 'adveriser_one'
      @advertiser_two = FactoryGirl.create :advertiser
      @advertiser_two.update(source_id: '12345')
    end

    it "should search by name" do
      adv = Advertiser.find_by_name_or_id_or_source_id 'one'
      adv.should_not be_nil
      adv.should == [@advertiser_one]
    end

    it "should search by source_id" do
      adv = Advertiser.find_by_name_or_id_or_source_id '12345'
      adv.should_not be_nil
      adv.should == [@advertiser_two]
    end
  end
end
