require 'spec_helper'

describe IoImport do
  let(:file) { Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Collective_IO.xls') }
  let(:current_user) { FactoryGirl.create(:user) }
  let(:io) { IoImport.new file, current_user }

  before { io.import }

  it "have access to xls filename"
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

  #it "sets current order advertiser with read advertiser" do 
  #  io.order.advertiser = io.advertiser
  #end
end
