require 'spec_helper'

describe Advertiser do
  it { should belong_to(:data_source) }
  it { should belong_to(:network) }
  it { should belong_to(:advertiser_type) }

  it { should have_many(:orders).with_foreign_key(:network_advertiser_id) }
  it { should have_many(:creatives).with_foreign_key(:network_advertiser_id) }

  describe "search by advertiser type" do
    let(:advertiser_type) { FactoryGirl.singleton(:advertiser_type) }

    before do
      house_advertiser_type = FactoryGirl.create(:advertiser_type, name: 'HOUSEADVERTISER')
      agency_type = FactoryGirl.create(:advertiser_type, name: 'AGENCY')

      advertiser = FactoryGirl.singleton(:advertiser)#, advertiser_type: advertiser_type)
      advertiser.advertiser_type = advertiser_type
      house_advertiser = FactoryGirl.singleton(:advertiser)
      house_advertiser.advertiser_type = house_advertiser_type
      agency = FactoryGirl.singleton(:advertiser)
      agency.advertiser_type = agency_type
    end

    it "should only return advertisers of type ADVERTISER" do
      adv = Advertiser.of_type_advertiser.all
      adv.size.should == 1
      expect(adv.first.advertiser_type.name).to eq advertiser_type.name
    end
  end

  describe "callbacks" do
    let(:advertiser) { FactoryGirl.singleton(:advertiser) }

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

  context "search by name" do
    before do
      @advertiser = FactoryGirl.create :advertiser, name: 'adveriser_one'
    end

    it "should search by name" do
      adv = Advertiser.find_by_name 'one'
      adv.should_not be_nil
      adv.should == [@advertiser]
    end
  end
end
