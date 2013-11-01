require 'spec_helper'

describe Admin::AudienceGroupsController do
  setup :activate_authlogic
  
  before :each do
    account = FactoryGirl.create(:account)
    AccountSession.create(account)
  end

  describe "GET 'index'" do
    it "returns http success" do
      get 'index'
      response.should be_success
    end
  end

  describe "GET 'new'" do
    it "returns http success" do
      get 'new'
      response.should be_success
    end
  end

  describe "GET 'edit'" do
    xit "returns http success" do
      get 'edit'
      response.should be_success
    end
  end

end
