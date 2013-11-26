require 'spec_helper'

describe IoImport do
  let(:file) { Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Collective_IO.xlsx') }
  let(:file_video_li) { Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Collective_IO_video_li.xlsx') }
  let(:data_source) { DataSource.create name: "Test Source", ident: "source ident" }
  let(:collective_network) { Network.create name: 'Collective', :data_source => data_source }
  let(:current_user) { FactoryGirl.create(:user, :network => collective_network) }
  let(:io) { IoImport.new file, current_user }
  let(:io_video_li) { IoImport.new file_video_li, current_user }

  before do
    @adv = Advertiser.create network_id: collective_network.id, name: "Otterbein University", source_id: '12345'
    sales_role = Role.create name: 'Sales'
    FactoryGirl.create :user, first_name: "Ronnie", last_name: "Wallace", phone_number: "646-442-8220", email: "ops@collective.com", :network => collective_network
    FactoryGirl.create :user, first_name: "Alexandra", last_name: "Piechota", phone_number: "646-786-6701", email: "ampnetwork@collective.com", :network => collective_network
    sales = FactoryGirl.create :user, first_name: "Eric", last_name: "Burns", phone_number: "919-604-4451", email: "eric@collective.com", :network => collective_network
    sales.roles << sales_role
    sales.save
    ReachClient.create name: "Time Warner Cable", abbr: "TWC", network_id: collective_network.id
    AdSize.create size: "300x250", width: 300, height: 250, network_id: collective_network.id
    AdSize.create size: "728x90", width: 728, height: 90, network_id: collective_network.id
    AdSize.create size: "160x600", width: 160, height: 600, network_id: collective_network.id
  end
 
  it "doesn't creates order and io_detail" do
    lambda {
      lambda {
        io.import
      }.should change(IoDetail, :count).by(0)
    }.should change(Order, :count).by(0)
  end

  context "IO imported" do
    before { io.import }
 
    it "reads advertiser correctly" do
      io.advertiser.should == @adv
    end

    it "have access to xls filename" do
      io.original_filename.should == "Collective_IO.xlsx"
    end

    it "have store when the xls filename was uploaded"

    it "reads info about order" do
      io.order.should be
    end

    it "associates order with current user" do
      io.order.user.should == current_user
    end

    it "associates order's network with current user's network" do
      io.order.network.should == current_user.network
    end
  end

  context "lineitems" do

    it "read all lineitems" do
      io.import

      expect(io).to have(2).lineitems
    end

    it "read display lineitems" do
      io.import

      expect(io.lineitems.select{|li| li.type == 'Display'}.length).to eq(2)
    end

    it "read video lineitems" do
      io_video_li.import

      expect(io_video_li.lineitems.select{|li| li.type == 'Video'}.length).to eq(2)
    end
  end
end

