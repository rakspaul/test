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
      ad1 = FactoryGirl.create :ad, order_id: @order.id, description: "Test ad #1"
      ad2 = FactoryGirl.create :ad, order_id: @order.id, description: "Test ad #2"
      FactoryGirl.create :ad_pricing, ad_id: ad1.id
      FactoryGirl.create :ad_pricing, ad_id: ad2.id
      AdSize.create size: "160x600", width: 160, height: 600, network_id: user.network.id
    end

    it "creates lineitems on-the-fly when opens dfp-pulled orders with ads" do
      expect(@order.lineitems.count).to eq(0)
      expect {
        xhr :get, :index, {order_id: @order.id}
      }.to change{@order.lineitems.count}.by(2)
    end
  end
end
