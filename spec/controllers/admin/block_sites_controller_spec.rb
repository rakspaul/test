require 'spec_helper'

describe Admin::BlockSitesController do
  setup :activate_authlogic


  before :each do
    account = FactoryGirl.create(:account)
    AccountSession.create(account)

    FactoryGirl.create(:blocked_advertiser)
    FactoryGirl.create(:blocked_advertiser, advertiser_id: 2, site_id: 2)
  end

  describe "GET 'advertisers_with_default_blocks'" do
      it "return advertiser id(s) with no records" do
        get 'advertisers_with_default_blocks', { advertiser_id: "1,2,3" }
        data = JSON.parse(response.body)
        expect(data["default_block"][0]).to eq 3
      end
  end

end
