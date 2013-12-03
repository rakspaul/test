require 'spec_helper'

describe AdPricing do
  it { should belong_to(:ad) }
  it { should belong_to(:data_source) }
  it { should belong_to(:network) }

  it "should validate quantity" do
    lineitem = FactoryGirl.build(:lineitem, volume: 100)
    ad = FactoryGirl.build(:ad, lineitem: lineitem)
    ad_pricing = FactoryGirl.build(:ad_pricing, ad: ad, quantity: 101)

    ad_pricing.valid?
    ad_pricing.errors.messages[:quantity].should include "Ad Impressions exceed Line Item Impressions"
  end

  describe "callbacks" do
    before do
      FactoryGirl.create(:ad_size_160x600)
      order = FactoryGirl.create(:order)
      lineitem = FactoryGirl.create(:lineitem, ad_sizes: "160x600", order: order)
      ad = FactoryGirl.create(:ad, lineitem: lineitem, order: order)
      @ad_pricing = FactoryGirl.create(:ad_pricing, ad: ad, quantity: "11,235")
    end

    it "should generate random source_id" do
      @ad_pricing.source_id.should match /R\_.+/
    end

    it "should set data source to network data source" do
      @ad_pricing.data_source.should == @ad_pricing.ad.network.data_source
    end

    it "should sanitize quantity" do
      @ad_pricing.quantity.should == 11235
    end
  end

end
