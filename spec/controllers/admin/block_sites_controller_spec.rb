require 'spec_helper'

describe Admin::BlockSitesController do
  setup :activate_authlogic

  let(:site_1) { FactoryGirl.create(:site, name: 'Site 1', source_id: "R_#{SecureRandom.uuid}") }
  let(:site_2) { FactoryGirl.create(:site, name: 'Site 2', source_id: "R_#{SecureRandom.uuid}") }
  let(:site_3) { FactoryGirl.create(:site, name: 'Site 3', source_id: "R_#{SecureRandom.uuid}") }
  let(:site_4) { FactoryGirl.create(:site, name: 'Site 4', source_id: "R_#{SecureRandom.uuid}") }

  let(:advertiser_1) { FactoryGirl.create :advertiser, name: 'adveriser_one' }
  let(:advertiser_2) { FactoryGirl.create :advertiser, name: 'adveriser_second' }
  let(:advertiser_3) { FactoryGirl.create :advertiser, name: 'adveriser_third' }
  let(:advertiser_4) { FactoryGirl.create :advertiser, name: 'adveriser_fourth' }
  let(:advertiser_5) { FactoryGirl.create :advertiser, name: 'adveriser_fifth' }
  let(:advertiser_6) { FactoryGirl.create :advertiser, name: 'adveriser_sixth' }

  let(:advertiser_group_1) { FactoryGirl.create :advertiser_block, name: 'adveriser_group_one' }
  let(:advertiser_group_2) { FactoryGirl.create :advertiser_block, name: 'adveriser_group_second' }
  let(:advertiser_group_3) { FactoryGirl.create :advertiser_block, name: 'adveriser_group_third' }
  let(:advertiser_group_4) { FactoryGirl.create :advertiser_block, name: 'adveriser_group_fourth' }

  before :each do
    @account = FactoryGirl.create(:account)
    AccountSession.create(@account)
  end

  describe "GET 'index'" do
    it "returns http success" do
      get 'index'
      response.should be_success
    end
  end

  describe "GET 'get_blacklisted_advertisers'" do

    before :each do
      FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_1, site: site_1, state: 'PENDING_BLOCK', user: @account.user)
      FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_2, site: site_2, state: 'BLOCK', user: @account.user)
    end

    it "returns http success" do
      get 'get_blacklisted_advertisers', { format: "json" }
      response.should be_success
    end

    it "returns pending advertiser blocks" do
      get 'get_blacklisted_advertisers', { format: "json" }
      data = JSON.parse(response.body)
      expect(data[0]["site_id"]).to eq site_1.id
    end

    it "returns blacklisted advertisers" do
      get 'get_blacklisted_advertisers', { format: "json", site_id: "#{site_1.id}, #{site_2.id}" }
      data = JSON.parse(response.body)
      expect(data[0]["site_id"]).to eq site_1.id
      expect(data[1]["site_id"]).to eq site_2.id
    end

  end

  describe "GET 'get_blacklisted_advertiser_groups'" do

    before :each do
      FactoryGirl.create(:blocked_advertiser_group, advertiser_block: advertiser_group_1, site: site_1, state: 'PENDING_BLOCK', user: @account.user)
      FactoryGirl.create(:blocked_advertiser_group, advertiser_block: advertiser_group_2, site: site_2, state: 'BLOCK', user: @account.user)
    end

    it "returns http success" do
      get 'get_blacklisted_advertiser_groups', { format: "json" }
      response.should be_success
    end

    it "returns pending advertiser group blocks" do
      get 'get_blacklisted_advertiser_groups', { format: "json" }
      data = JSON.parse(response.body)
      expect(data[0]["site_id"]).to eq site_1.id
    end

    it "returns blacklisted advertiser groups" do
      get 'get_blacklisted_advertiser_groups', { format: "json", site_id: "#{site_1.id}, #{site_2.id}" }
      data = JSON.parse(response.body)
      expect(data[0]["site_id"]).to eq site_1.id
      expect(data[1]["site_id"]).to eq site_2.id
    end

  end

  describe "GET 'get_whitelisted_advertiser'" do

    before :each do
      FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_1, site: site_1, state: 'PENDING_UNBLOCK', user: @account.user)
      FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_2, site: site_2, state: 'UNBLOCK', user: @account.user)
    end

    it "returns http success" do
      get 'get_whitelisted_advertiser', { format: "json" }
      response.should be_success
    end

    it "returns pending advertiser unblocks" do
      get "get_whitelisted_advertiser", { format: "json" }
      data = JSON.parse(response.body)
      expect(data[0]["site_id"]).to eq site_1.id
    end

    it "returns whitelisted advertisers" do
      get "get_whitelisted_advertiser", { format: "json", site_id: "#{site_1.id}, #{site_2.id}" }
      data = JSON.parse(response.body)
      expect(data[0]["site_id"]).to eq site_1.id
      expect(data[1]["site_id"]).to eq site_2.id
    end

  end

  describe "GET 'get_whitelisted_advertiser_groups'" do

    before :each do
      FactoryGirl.create(:blocked_advertiser_group, advertiser_block: advertiser_group_1, site: site_1, state: 'PENDING_UNBLOCK', user: @account.user)
      FactoryGirl.create(:blocked_advertiser_group, advertiser_block: advertiser_group_2, site: site_2, state: 'UNBLOCK', user: @account.user)
    end

    it "returns http success" do
      get 'get_whitelisted_advertiser_groups', { format: "json" }
      response.should be_success
    end

    it "returns whitelisted advertiser groups" do
      get "get_whitelisted_advertiser_groups", { format: "json" }
      data = response.body
      data = JSON.parse(response.body)
      expect(data[0]["site_id"]).to eq site_1.id
    end

  end

  describe "POST 'create'" do
    before :each do
      FactoryGirl.create(:default_site_blocks, site: site_2, user: @account.user)
      FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_2, site: site_2, state: 'PENDING_UNBLOCK', user: @account.user)

      @blocked_advertiser_1 = FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_4, site: site_4, state: 'PENDING_BLOCK', user: @account.user)
      @blocked_advertiser_2 = FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_6, site: site_4, state: 'PENDING_UNBLOCK', user: @account.user)
      @blocked_advertiser_group_1 = FactoryGirl.create(:blocked_advertiser_group, advertiser_block: advertiser_group_3, site: site_4, state: 'PENDING_UNBLOCK', user: @account.user)
      @blocked_advertiser_group_2 = FactoryGirl.create(:blocked_advertiser_group, advertiser_block: advertiser_group_4, site: site_4, state: 'PENDING_BLOCK', user: @account.user)
    end

    it "should blacklist an advertiser" do
      expect {
        post :create, blacklist_advertisers_params
      }.to change(BlockedAdvertiser, :count).by(4)

      # advertiser_1 is blacklisted on site_1 since advertiser_1 is not blacklisted on any other sites it will get blocked on all the default block list site (in this case site_2 ). (no of blocks 2)
      # advertiser_1 is blacklisted on site_3 since advertiser_1 is already blocked on site_1 it will not get blocked on default site blocks. (no of blocks 1)
      # advertiser_2 is blacklisted on site_1 since advertiser_2 is not blacklisted on any other sites it will get blocked on all the default block list site but advertiser_2 is whitelisted on one of the default block list site (site_2) so it will get blocked on site_1 only. (no of blocks 1)

    end

    it "should whitelist an advertiser" do
      expect {
        post :create, whitelist_advertisers_params
      }.to change(BlockedAdvertiser, :count).by(1)
    end

    it "should block_advertisers" do
      post :create, block_advertisers_params
      expect(BlockedAdvertiser.find(@blocked_advertiser_2.id).state).to eq BlockSite::BLOCK
    end

    it "should unblock an advertiser" do
      post :create, unblock_advertiser_params
      expect(BlockedAdvertiser.find(@blocked_advertiser_1.id).state).to eq BlockSite::UNBLOCK
    end

    it "should delete blacklisted advertiser" do
      expect {
        post :create, delete_advertiser_params
      }.to change(BlockedAdvertiser, :count).by(-1)
    end

    it "should blacklist an advertiser group" do
      expect {
        post :create, blacklist_advertiser_groups_params
      }.to change(BlockedAdvertiserGroup, :count).by(1)
    end

    it "should whitelist an advertiser group" do
      expect {
        post :create, whitelist_advertiser_groups_params
      }.to change(BlockedAdvertiserGroup, :count).by(1)
    end

    it "should block advertiser group" do
      post :create, blocked_advertiser_group_params
      expect(BlockedAdvertiserGroup.find(@blocked_advertiser_group_1.id).state).to eq BlockSite::BLOCK
    end

    it "should delete advertiser group" do
      expect {
        post :create, delete_advertiser_group_params
      }.to change(BlockedAdvertiserGroup, :count).by(-1)
    end

  end

  describe "POST 'commit'" do
    before :each do
      @advertiser_block_1 = FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_1, site: site_1, state: 'PENDING_BLOCK', user: @account.user)
      @advertiser_block_2 = FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_2, site: site_1, state: 'PENDING_UNBLOCK', user: @account.user)

      @advertiser_group_block_1 = FactoryGirl.create(:blocked_advertiser_group, advertiser_block: advertiser_group_1, site: site_2, state: 'PENDING_BLOCK', user: @account.user)
      @advertiser_group_block_2 = FactoryGirl.create(:blocked_advertiser_group, advertiser_block: advertiser_group_2, site: site_2, state: 'PENDING_UNBLOCK', user: @account.user)
    end

    it "returns http success" do
      post :commit
      expect(response).to be_success
    end

    it "changes status code" do
      post :commit
      (expect(BlockedAdvertiser.find(@advertiser_block_1.id).state).to eq BlockSite::COMMIT_BLOCK) &&
      (expect(BlockedAdvertiser.find(@advertiser_block_2.id).state).to eq BlockSite::COMMIT_UNBLOCK) &&
      (expect(BlockedAdvertiserGroup.find(@advertiser_group_block_1.id).state).to eq BlockSite::COMMIT_BLOCK) &&
      (expect(BlockedAdvertiserGroup.find(@advertiser_group_block_2.id).state).to eq BlockSite::COMMIT_UNBLOCK)
    end
  end

  describe "GET 'export_blacklisted_advertisers_and_groups'" do
    before :each do
      FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_1, site: site_1, state: 'PENDING_BLOCK', user: @account.user)
      FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_2, site: site_2, state: 'BLOCK', user: @account.user)

      FactoryGirl.create(:blocked_advertiser_group, advertiser_block: advertiser_group_1, site: site_1, state: 'PENDING_BLOCK', user: @account.user)
      FactoryGirl.create(:blocked_advertiser_group, advertiser_block: advertiser_group_2, site: site_2, state: 'BLOCK', user: @account.user)
    end

    it "return http success" do
      get 'export_blacklisted_advertisers_and_groups', { format: :xls }
      expect(response).to be_success
    end

    it "send xls file" do
      get 'export_blacklisted_advertisers_and_groups', { format: :xls, site_ids: "#{site_1.id}, #{site_2.id}" }
      expect(response.content_type.to_s).to eq Mime::Type.lookup_by_extension(:xls).to_s
    end

  end

  describe "GET 'export_whitelisted_advertisers'" do
    before :each do
      FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_1, site: site_1, state: 'PENDING_UNBLOCK', user: @account.user)
      FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_2, site: site_2, state: 'UNBLOCK', user: @account.user)
    end

    it "return http success" do
      get 'export_whitelisted_advertisers', { format: :xls }
      expect(response).to be_success
    end

    it "send xls file" do
      get 'export_whitelisted_advertisers', { format: :xls, site_ids: "#{site_1.id}, #{site_2.id}" }
      expect(response.content_type.to_s).to eq Mime::Type.lookup_by_extension(:xls).to_s
    end

  end

  describe "GET 'advertisers_with_default_blocks'" do

    before :each do
      FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_1, site: site_1, state: 'PENDING_BLOCK', user: @account.user)
      FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_2, site: site_2, state: 'BLOCK', user: @account.user)
    end

    it "returns advertiser id(s) with no records" do
      get 'advertisers_with_default_blocks', { advertiser_id: "#{advertiser_1.id}, #{advertiser_2.id}, #{advertiser_3.id}" }
      data = JSON.parse(response.body)
      expect(data["default_block"][0]).to eq advertiser_3.id
    end

  end

private
  def blacklist_advertisers_params
    params = {
      format: 'json',
      blacklistedAdvertisers: ActiveSupport::JSON.encode(
        [
          {advertiser_id: advertiser_1.id.to_s, site_id: site_1.id.to_s},
          {advertiser_id: advertiser_1.id.to_s, site_id: site_3.id.to_s},
          {advertiser_id: advertiser_2.id.to_s, site_id: site_1.id.to_s}
        ]
      )
    }
  end

  def blacklist_advertiser_groups_params
    params = {
      format: 'json',
      blacklistedAdvertiserGroups: ActiveSupport::JSON.encode(
        [
          {advertiser_group_id: advertiser_group_1.id.to_s, site_id: site_1.id.to_s}
        ]
      )
    }
  end

  def whitelist_advertisers_params
    params = {
      format: 'json',
      whitelistedAdvertisers: ActiveSupport::JSON.encode(
        [
          {advertiser_id: advertiser_1.id.to_s, site_id: site_1.id.to_s}
        ]
      )
    }
  end

  def whitelist_advertiser_groups_params
    params = {
      format: 'json',
      whitelistedAdvertiserGroups: ActiveSupport::JSON.encode(
        [
          {advertiser_group_id: advertiser_group_1.id.to_s, site_id: site_1.id.to_s}
        ]
      )
    }
  end

  def block_advertisers_params
    params = {
      format: 'json',
      blockedAdvertisers: ActiveSupport::JSON.encode(
        [
          {advertiser_id: advertiser_6.id.to_s, site_id: site_4.id.to_s}
        ]
      )
    }
  end

  def unblock_advertiser_params
    params = {
      format: 'json',
      unblockAdvertisers: ActiveSupport::JSON.encode(
        [
          {advertiser_id: advertiser_4.id.to_s, site_id: site_4.id.to_s}
        ]
      )
    }
  end

  def delete_advertiser_params
    params = {
      format: 'json',
      deletedBlacklistedAdvertisers: ActiveSupport::JSON.encode(
        [
          {advertiser_id: advertiser_4.id.to_s, site_id: site_4.id.to_s}
        ]
      )
    }
  end

  def blocked_advertiser_group_params
    params = {
      format: 'json',
      blockedAdvertiserGroups: ActiveSupport::JSON.encode(
        [
          {advertiser_group_id: advertiser_group_3.id.to_s, site_id: site_4.id.to_s}
        ]
      )
    }
  end

  def delete_advertiser_group_params
    params = {
      format: 'json',
      deletedAdvertiserGroups: ActiveSupport::JSON.encode(
        [
          {advertiser_group_id: advertiser_group_4.id.to_s, site_id: site_4.id.to_s}
        ]
      )
    }
  end

end
