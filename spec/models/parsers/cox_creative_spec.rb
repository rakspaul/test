require 'spec_helper'

describe Parsers::CoxCreative do
  let(:file) { Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Cox_creatives.txt') }
  let(:file2) { Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Cox_creatives2.txt') }

  let(:user) { FactoryGirl.create :user }
  let(:advertiser) { FactoryGirl.create :advertiser, network: user.network }
  let(:agency) { FactoryGirl.create :agency, network: user.network }

  context "create 1 creative under 1 correct LI" do
    before do
      reach_client = ReachClient.create name: "COX", abbr: "COX", network: user.network, sales_person_id: user.id, account_manager_id: user.id, user_id: user.id, agency_id: agency.id
      mc = MediaContact.create name: "test", phone: '1234567', email: 'test@example.com', reach_client_id: reach_client.id
      bc = BillingContact.create name: "test", phone: '1234567', email: 'test@example.com', reach_client_id: reach_client.id

      @order = Order.create user_id: user.id, network: user.network, network_advertiser_id: advertiser.id, start_date: (Time.current + 1.day), end_date: (Time.current + 12.days), name: "Rodenbaugh's on Audience Network / TWCC (10/3 - 12/29/13) - 788977"
      @order.errors.messages.should == {}

      io_detail = IoDetail.create sales_person_email: "example@test.com", sales_person_phone: "1234567890", account_manager_email: "test@example.com", account_manager_phone: "1234567890", client_order_id: "1234567890", client_advertiser_name: "LexisNexis", media_contact: mc, billing_contact: bc, sales_person: user, reach_client: reach_client, order_id: @order.id, account_manager: user, state: "draft"

      @order.io_detail = io_detail
      @order.save
      @order.reload

      ["160x600", "300x250", "728x90"].each do |ad_size|
        width, height = ad_size.split('x')
        AdSize.create size: ad_size, width: width, height: height, network: @order.network
      end

      @li = Lineitem.create order_id: @order.id, user_id: user.id, start_date: (Time.current + 5.day), end_date: (Time.current + 12.days), name: "CDS Added Value_Run of Network_ZipTargeted to 30 Mile Radius of Mtn View_12/1-12/15", volume: 300_000, rate: 2.22, value: 666.00, ad_sizes: "160x600, 300x250, 728x90"
      @li.errors.messages.should == {}
    end

    let(:io_creatives) { Parsers::CoxCreative.new file, @order.id }
    let(:io_creatives2) { Parsers::CoxCreative.new file2, @order.id }

    it 'should parse text document' do
      Parsers::CoxCreative.any_instance.stub(:start_date).and_return(Time.current + 5.day)
      Parsers::CoxCreative.any_instance.stub(:end_date).and_return(Time.current + 12.day)

      expect {
        expect {
          io_creatives.parse
        }.to change{ LineitemAssignment.count }.by(3)
      }.to change{ Creative.count }.by(3)
    end

    it "should find corresponding LI correctly even if hasn't some blank spaces" do
      Parsers::CoxCreative.any_instance.stub(:start_date).and_return(Time.current + 5.day)
      Parsers::CoxCreative.any_instance.stub(:end_date).and_return(Time.current + 12.day)

      expect {
        expect {
          io_creatives2.parse
        }.to change{ LineitemAssignment.count }.by(1)
      }.to change{ Creative.count }.by(1)
    end
  end
end
