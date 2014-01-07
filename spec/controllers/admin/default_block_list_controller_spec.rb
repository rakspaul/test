require 'spec_helper'

describe Admin::DefaultBlockListController do
  setup :activate_authlogic

  let(:site_1) { FactoryGirl.create(:site, name: 'Site 1', source_id: "R_#{SecureRandom.uuid}") }
  let(:site_2) { FactoryGirl.create(:site, name: 'Site 2', source_id: "R_#{SecureRandom.uuid}") }
  let(:site_3) { FactoryGirl.create(:site, name: 'Site 3', source_id: "R_#{SecureRandom.uuid}") }
  let(:advertiser_1) { FactoryGirl.create :advertiser, name: 'adveriser_one' }

  before :each do
    account = FactoryGirl.create(:account)
    AccountSession.create(account)

    @default_block = FactoryGirl.create(:default_site_blocks, site: site_1, user: account.user)
    FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_1, site: site_2, state: 'PENDING_BLOCK', user: account.user)
  end

  describe "GET 'index'" do
    it "returns http success" do
      get 'index'
      response.should be_success
    end

    it "returns default blocks" do
      get 'index', { format: "json" }
      data = JSON.parse(response.body)
      expect(data[0]["site_id"]).to eq site_1.id
    end
  end

  describe "POST 'create'" do
    it "creates new default blocks" do
      expect {
        post :create, new_default_site_block
      }.to change(DefaultSiteBlocks, :count).by(1)
    end

    it "creates default block and blocks it on existing blacklisted advertisers" do
      expect {
        post :create, new_default_site_block
      }.to change(BlockedAdvertiser, :count).by(1)
    end

    it "removes default blocks" do
      expect {
        post :create, delete_default_site_block
      }.to change(DefaultSiteBlocks, :count).by(-1)
    end
  end

  describe "GET 'export'" do
    it "returns http success" do
      get 'export', { format: :xls }
      response.should be_success
    end

    it "send xls file" do
      get 'export', { format: :xls }
      expect(response.content_type.to_s).to eq Mime::Type.lookup_by_extension(:xls).to_s
    end
  end

  describe "GET 'whitelisted_sites'" do
    it "returns http success" do
      get 'whitelisted_sites', { format: :json }
      response.should be_success
    end

    it "returns default blocks" do
      get 'whitelisted_sites', { format: :json, search: 'Site 1' }
      data = JSON.parse(response.body)
      expect(data[0]["id"]).to eq site_1.id
    end

  end

private

  def new_default_site_block
    params = {
      format: 'json',
      newSiteBlocks: ActiveSupport::JSON.encode(
        [
          {site_id: site_3.id.to_s}
        ]
      )
    }
  end

  def delete_default_site_block
    params = {
      format: 'json',
      siteBlocksToDelete: ActiveSupport::JSON.encode(
        [
          {id: @default_block.id}
        ]
      )
    }
  end

end
