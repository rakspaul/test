require 'spec_helper'

describe Order do
  let(:order) { FactoryGirl.create :order_with_lineitem, name: 'Order Model spec' }
  let!(:frequency_cap) { FactoryGirl.create :li_frequency_cap, lineitem: order.lineitems.first }

  context "delete" do
    it "should delete order lineitems" do
      expect { order.destroy }.to change(Lineitem, :count).by(-1)
    end
  end


  context "validation" do
    let(:data_source) { DataSource.first || FactoryGirl.singleton(:data_source) }
    let(:network)  { FactoryGirl.singleton :network }
    let(:network2) { FactoryGirl.create :network, id: 7, name: 'Order validation', data_source: data_source }
    let(:order)    { FactoryGirl.create :order, name: 'Test validation', network: network }
    let(:order2)   { FactoryGirl.create :order, name: 'Test validation name', network: network }

    it "should allow only uniq names" do
      expect(order2.valid?).to be true
    end

    it "should allow the same names in different networks" do
      order2.network = network2
      order2.name    = order.name
      expect(order2.valid?).to be true
    end

    it "should not allow the same names" do
      order2.name    = order.name
      expect(order2.valid?).to be false
    end

    it "should validate the kpi_type & kpi_value" do
      order.kpi_type.should be_nil
      order.kpi_value.should be_nil
      order.valid?.should be_true

      order.update kpi_type: 'CPM'
      order.valid?.should be_false
      order.errors[:kpi_value].first.should == 'can\'t be empty'

      order2.update kpi_value: '10'
      order2.valid?.should be_false
      order2.errors[:kpi_type].first.should == 'can\'t be empty'

      #only integers are allowed for action, clicks & impressions
      order2.update kpi_type: Order::KpiTypes::ACTIONS, kpi_value: '10'
      order2.valid?.should be_true
      order2.update kpi_type: Order::KpiTypes::CLICKS, kpi_value: 20
      order2.valid?.should be_true
      order2.update kpi_type: Order::KpiTypes::IMPRESSIONS, kpi_value: '10'
      order2.valid?.should be_true

      order2.update kpi_type: Order::KpiTypes::ACTIONS, kpi_value: '10.5'
      order2.valid?.should be_false
      order2.update kpi_type: Order::KpiTypes::CLICKS, kpi_value: 10.5
      order2.valid?.should be_false
      order2.update kpi_type: Order::KpiTypes::IMPRESSIONS, kpi_value: '10.5'
      order2.valid?.should be_false

      #percentage is allowed for CTR & Video Completion
      order2.update kpi_type: Order::KpiTypes::CTR, kpi_value: '100.5'
      order2.valid?.should be_false
      # order2.update kpi_type: Order::KpiTypes::VIDEO_COMPLETION, kpi_value: '-0.5'
      # order2.valid?.should be_false

      order2.update kpi_type: Order::KpiTypes::CTR, kpi_value: '90'
      order2.valid?.should be_true
      # order2.update kpi_type: Order::KpiTypes::VIDEO_COMPLETION, kpi_value: '5'
      # order2.valid?.should be_true

      #CPA, CPC, CPM, CPCV is currency
      order2.update kpi_type: Order::KpiTypes::CTR, kpi_value: '-100'
      order2.valid?.should be_false
      order2.update kpi_type: Order::KpiTypes::CPC, kpi_value: '5.123'
      order2.valid?.should be_true
      order2.update kpi_type: Order::KpiTypes::CPM, kpi_value: 100000
      order2.valid?.should be_true
      # order2.update kpi_type: Order::KpiTypes::CPCV, kpi_value: '50.45'
      # order2.valid?.should be_true
    end
  end

  context "search scope" do
    let(:number_term)         { 1234567 }
    let(:network)             { FactoryGirl.singleton :network }
    let(:order_with_number)   { FactoryGirl.create(:order, name: 'Test search number in name 1234567', network: network) }

    it "search number in order name" do
      Order.joins(:io_detail).by_search_query(number_term).should include(order_with_number)
    end
  end
end
