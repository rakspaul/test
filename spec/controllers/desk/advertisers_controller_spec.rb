require 'spec_helper'

describe Desk::AdvertisersController do
  setup :activate_authlogic

  before :each do
    account = FactoryGirl.create(:account)
    AccountSession.create(account)

    @agency1 = FactoryGirl.create :agency, :name => 'agency1'
    @agency2 = FactoryGirl.create :agency, :name => 'agency2'
    @agency3 = FactoryGirl.create :agency, :name => 'agency3'

    @advertiser_1 = FactoryGirl.create :advertiser, name: 'advertiser_one'
    @advertiser_2 = FactoryGirl.create :advertiser, name: 'advertiser_second'
    @advertiser_3 = FactoryGirl.create :advertiser, name: 'advertiser_third'
    FactoryGirl.create :order, :agency => @agency1, :advertiser => @advertiser_1
    FactoryGirl.create :order, :agency => @agency1, :advertiser => @advertiser_2
    FactoryGirl.create :order, :agency => @agency2, :advertiser => @advertiser_3
  end

  describe "list_network_advertisers" do

    it "get all advertisers for network user" do
      get :list_network_advertisers, { format: "json" }

      response.should be_success

      data = json_parse(response.body)
      data.count.should == 3
    end
  end

  describe "search_network_advertisers" do
    it "search advertiser for network user by search param" do
      get  :search_network_advertisers, {format: 'json', search: 'one'}

      data = json_parse(response.body)
      expect(data[0][:name]).to eq('advertiser_one')
    end

    it "search advertiser for network user by search param" do
      get  :search_network_advertisers, {format: 'json'}

      data = json_parse(response.body)
      data.count.should == 3
    end
  end

  describe "'index' for agency advertiser" do
    it "index all advertisers for agency user" do
      get :index, {agency_id: @agency1.id, format: "json"}

      data = json_parse(response.body)
      expect(data[0][:name]).to eq('advertiser_one')
    end

    it "index all advertisers for agency user" do
      get :index, {agency_id: @agency2.id, format: "json"}

      response.should be_success

      data = json_parse(response.body)
      data.count.should == 1
    end

    it "index all advertisers for agency user" do
      get :index, {agency_id: @agency3.id, format: "json"}

      response.should be_success

      data = json_parse(response.body)
      data.count.should == 0
    end
  end

  describe "'search' for agency advertiser" do
    it "search advertiser for agency user by search param" do
      get :search , {agency_id: @agency1.id, format: "json" , search: 'one'}

      data = json_parse(response.body)
      expect(data[0][:name]).to eq('advertiser_one')
    end

    it "search advertiser for agency user by search param" do
      get :search , {agency_id: @agency1.id, format: "json" , search: 'three'}

      response.should be_success

      data = json_parse(response.body)
      data.count.should == 0
    end
  end
end
