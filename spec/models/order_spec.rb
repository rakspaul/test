require 'spec_helper'

describe Order do
  let(:order) { FactoryGirl.create :order_with_lineitem, name: 'Order Model spec' }
  let!(:frequency_cap) { FactoryGirl.create :li_frequency_cap, lineitem: order.lineitems.first }

  context "delete" do
    it "should delete order lineitems" do
      expect { order.destroy }.to change(Lineitem, :count).by(-1)
    end
  end
end
