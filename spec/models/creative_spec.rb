require 'spec_helper'

describe Creative do
  let(:user) { FactoryGirl.create :user }
  let(:advertiser) { FactoryGirl.create :advertiser, network: user.network }

  context "wrong flight dates" do
    before do
      @order = Order.create user_id: user.id, network: user.network, network_advertiser_id: advertiser.id, start_date: (Time.current + 1.day), end_date: (Time.current + 12.days), name: "Rodenbaugh's on Audience Network / TWCC (10/3 - 12/29/13) - 788977"
      @order.errors.messages.should == {}

      AdSize.create size: "160x600", width: 160, height: 600, network: @order.network
      AdSize.create size: "300x250", width: 300, height: 250, network: @order.network
      AdSize.create size: "728x90", width: 728, height: 90, network: @order.network

      @li = Lineitem.create order_id: @order.id, user_id: user.id, start_date: (Time.current + 5.day), end_date: (Time.current + 12.days), name: "Family, Home Owners, Mid HHI ($60k-$150k); Dallas RON", volume: 300_000, rate: 2.22, value: 666.00, ad_sizes: "160x600, 300x250, 728x90"
      @li.errors.messages.should == {}

      @ad = Ad.create order_id: @order.id, io_lineitem_id: @li.id, size: "160x600", start_date: @li.start_date, end_date: @li.end_date, description: "Test description"
      @ad.errors.messages.should == {}
    end

    it "start/end date should be within ad's start/end date range" do
      creative = Creative.create name: "Test creative", size: "160x600", width: 160, height: 600, redirect_url: "http://ad.doubleclick.net/ad/twc.collective;adid=83790015;sz=160x600", network_advertiser_id: advertiser.id
      creative.errors.messages.should == {}

      assignment = AdAssignment.new creative_id: creative.id, ad_id: @ad.id, start_date: (@ad.start_date - 6.days), end_date: (@ad.end_date - 3.days), network_id: @order.network.id
      assignment.valid?.should == false
      assignment.errors[:start_date].should be
      assignment.errors[:end_date].should be

      assignment.start_date = @ad.start_date
      assignment.end_date = @ad.start_date
      assignment.valid?.should be
      assignment.errors.messages.should == {}
    end

    it "start/end date should be within lineitem's start/end date range" do
      creative = Creative.create name: "Test creative", size: "160x600", width: 160, height: 600, redirect_url: "http://ad.doubleclick.net/ad/twc.collective;adid=83790015;sz=160x600", network_advertiser_id: advertiser.id
      creative.errors.messages.should == {}

      assignment = LineitemAssignment.new creative_id: creative.id, io_lineitem_id: @li.id, start_date: (@li.start_date - 6.days), end_date: (@li.end_date - 3.days), network_id: @order.network.id
      assignment.valid?.should == false
      assignment.errors[:start_date].should be
      assignment.errors[:end_date].should be

      assignment.start_date = @li.start_date
      assignment.end_date = @li.start_date
      assignment.valid?.should be
      assignment.errors.messages.should == {}
    end
  end
end
