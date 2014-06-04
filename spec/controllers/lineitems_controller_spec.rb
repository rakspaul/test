require 'spec_helper'

describe LineitemsController do
  setup :activate_authlogic

  before :each do
    @account = FactoryGirl.create(:account)
    AccountSession.create(@account)
  end

  context "order pulled from DFP" do
    let(:data_source) { DataSource.create name: "Test Source", ident: "source ident" }
    let(:collective_network) { Network.create name: 'Collective', :data_source => data_source }
    let(:user) { FactoryGirl.create :user } 

    before do
      @order = FactoryGirl.create :dfp_pulled_order
      creative = FactoryGirl.create :creative
      creative2 = FactoryGirl.create :creative
      video_creative = FactoryGirl.create :video_creative
      video_creative2 = FactoryGirl.create :video_creative
      @ad1 = FactoryGirl.create :ad, order_id: @order.id, description: "Test ad #1", alt_ad_id: '1'
      @city = FactoryGirl.create(:city)
      @dma = FactoryGirl.create(:designated_market_area)
      @state = FactoryGirl.create(:state)
      @ad1.geo_targets = [@city, @dma, @state]
      [:segment1, :segment2, :context1, :context2].each{|factory| FactoryGirl.create(factory)}
      @ag = FactoryGirl.create(:audience_group)
      @ad1.audience_groups << @ag

      ad2 = FactoryGirl.create :ad, order_id: @order.id, description: "Test ad #2", alt_ad_id: '2'
      FactoryGirl.create :ad_pricing, ad_id: @ad1.id
      FactoryGirl.create :ad_pricing, ad_id: ad2.id
      FactoryGirl.create :ad_assignment, ad: @ad1, creative: creative, start_date: @ad1.start_date, end_date: @ad1.end_date
      FactoryGirl.create :ad_assignment, ad: ad2, creative: creative2, start_date: ad2.start_date, end_date: ad2.end_date
      FactoryGirl.create :video_ad_assignment, ad: @ad1, video_creative: video_creative, start_date: @ad1.start_date, end_date: @ad1.end_date
      FactoryGirl.create :video_ad_assignment, ad: ad2, video_creative: video_creative2, start_date: ad2.start_date, end_date: ad2.end_date
      AdSize.create size: "160x600", width: 160, height: 600, network_id: user.network.id
    end

    it "creates lineitems on-the-fly when opens dfp-pulled orders with ads" do
      expect(@order.lineitems.count).to eq(0)
      expect {
        xhr :get, :index, {order_id: @order.id}
      }.to change{@order.lineitems.count}.by(2)
      expect(@order.lineitems.first.ads.count).to eq(1)
      expect(@order.lineitems.last.ads.count).to eq(1)
    end

    it "names LIs consequently" do
      xhr :get, :index, {order_id: @order.id}
      expect(@order.lineitems.first.name).to eq("Contract Line Item 1")
      expect(@order.lineitems.last.name).to eq("Contract Line Item 2")
    end

    it "creates lineitem_assignments for creatives" do
      xhr :get, :index, {order_id: @order.id}

      @order.lineitems.map do |li|
        expect(li.creatives.count).to eq(1)
      end 
    end

    it "sets *uploaded* flag on lineitem to false" do
      xhr :get, :index, {order_id: @order.id}

      @order.lineitems.map do |li|
        expect(li.uploaded).to eq(false)
      end
    end

    it "creates lineitem_video_assignments for creatives" do
      xhr :get, :index, {order_id: @order.id}

      @order.lineitems.map do |li|
        expect(li.video_creatives.count).to eq(1)
      end
    end

    it "saves targeting information in newly created LIs" do
      xhr :get, :index, {order_id: @order.id}

      li = @order.lineitems.detect{|li| li.ads.first == @ad1}
      expect(li.geo_targets.count).to eq(3)
      expect(li.cities.first).to eq(@city)
      expect(li.designated_market_areas.first).to eq(@dma)
      expect(li.states.first).to eq(@state)
      expect(li.audience_groups.count).to eq(1)
      expect(li.audience_groups.first).to eq(@ag)
    end
  end
end
