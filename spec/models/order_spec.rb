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
  end
end
