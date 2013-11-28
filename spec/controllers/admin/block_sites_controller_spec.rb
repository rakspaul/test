require 'spec_helper'

describe Admin::BlockSitesController do
  setup :activate_authlogic


  before :each do
    account = FactoryGirl.create(:account)
    AccountSession.create(account)

    blocked_advertiser_one = FactoryGirl.create(:blocked_advertiser,
      advertiser_id: 1,
      site_id: 1,
      state: 'BLOCK',
      type: 'BlockedAdvertiser',
      network: FactoryGirl.singleton(:network),
      user_id: FactoryGirl.singleton(:user).id)

    blocked_advertiser_two = FactoryGirl.create(:blocked_advertiser,
      advertiser_id: 2,
      site_id: 2,
      state: 'BLOCK',
      type: 'BlockedAdvertiser',
      network: FactoryGirl.singleton(:network),
      user_id: FactoryGirl.singleton(:user).id)
  end

  describe "GET 'default_block_for_advertiser'" do
      it "return advertiser id(s) with no records" do
        get 'default_block_for_advertiser', { advertiser_id: "1,2,3" }
        data = JSON.parse(response.body)
        expect(data["default_block"][0]).to eq 3
      end
  end

end
