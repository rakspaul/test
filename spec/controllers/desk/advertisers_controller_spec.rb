require 'spec_helper'

describe Desk::AdvertisersController do
  setup :activate_authlogic

  before :each do
    @account = FactoryGirl.create(:account)
    AccountSession.create(@account)

    @agency1 = FactoryGirl.create :agency, :name => 'agency1'
    @agency2 = FactoryGirl.create :agency, :name => 'agency2'
    @agency3 = FactoryGirl.create :agency, :name => 'agency3'

    @advertiser_1 = FactoryGirl.create :advertiser, name: 'advertiser_one'
    @advertiser_2 = FactoryGirl.create :advertiser, name: 'advertiser_second'
    @advertiser_3 = FactoryGirl.create :advertiser, name: 'advertiser_third'
    @order1 = FactoryGirl.create :order, :agency => @agency1, :advertiser => @advertiser_1
    @order2 = FactoryGirl.create :order, :agency => @agency1, :advertiser => @advertiser_2
    @order3 = FactoryGirl.create :order, :agency => @agency2, :advertiser => @advertiser_3
  end


  describe "index" do
    it "should return all advertisers for current network user" do
      get :index, {format: "json"}

      data = json_parse(response.body)

      data.count.should == 3
      data.sort! {|o1, o2| o1['id'] <=> o2['id']}
      expect(data[0][:name]).to eq('advertiser_one')
    end

    it "should return all advertisers for the current agency user" do
      agency_user = FactoryGirl.create :user, :client_type => 'Agency', :agency => @agency3
      controller.should_receive(:current_user).exactly(3).and_return(agency_user)

      get :index, {format: "json"}

      response.should be_success

      data = json_parse(response.body)
      data.count.should == 0

      agency_user = FactoryGirl.create :user, :client_type => 'Agency', :agency => @agency2
      controller.should_receive(:current_user).exactly(3).and_return(agency_user)

      get :index, {agency_id: @agency2.id, format: "json"}

      response.should be_success

      data = json_parse(response.body)
      data.count.should == 1
    end
  end

  describe "search" do
    it "should return all advertisers for the given search param" do
      get :search , {format: "json" , search: 'one'}

      data = json_parse(response.body)
      data.count.should == 1
      expect(data[0][:name]).to eq('advertiser_one')

      get :search , {format: "json" , search: 'advertiser'}

      response.should be_success

      data = json_parse(response.body)
      data.count.should == 3
    end

    it "search advertiser for agency user by search param - 1" do
      agency_user = FactoryGirl.create :user, :client_type => 'Agency', :agency => @agency1
      controller.should_receive(:current_user).exactly(3).and_return(agency_user)

      get :search , {format: "json" , search: 'third'}

      data = json_parse(response.body)
      data.count.should == 0
    end

    it "search advertiser for agency user by search param - 2" do
      agency_user = FactoryGirl.create :user, :client_type => 'Agency', :agency => @agency1
      controller.should_receive(:current_user).exactly(3).and_return(agency_user)
      get :search , {format: "json" , search: 'advertiser'}

      response.should be_success

      data = json_parse(response.body)
      data.count.should == 2
    end
  end
end
