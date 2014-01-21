require 'spec_helper'

describe Admin::BlockLogsController do
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

  describe "GET 'export'" do
    it "returns http success" do
      get 'export', { format: :csv }
      response.should be_success
    end

    it "send csv file" do
      get 'export', { format: :csv }
      expect(response.content_type.to_s).to eq Mime::Type.lookup_by_extension(:csv).to_s
    end
  end

end
