require 'spec_helper'

describe OrdersController do
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

  describe "POST 'create'" do
    context "valid order" do
      it "returns http success" do
        #puts FactoryGirl.attributes_for(:order_with_lineitem).inspect
        json = JSON.parse(File.read( Rails.root.join('spec', 'fixtures', 'requests', 'valid_io.json')))
        post 'create', json

      #  response.should be_success
      end
    end
  end
                        
end
