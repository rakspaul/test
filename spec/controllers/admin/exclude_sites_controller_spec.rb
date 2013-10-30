require 'spec_helper'

describe Admin::ExcludeSitesController do
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

end
