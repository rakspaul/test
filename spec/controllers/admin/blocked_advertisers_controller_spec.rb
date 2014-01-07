require 'spec_helper'

describe Admin::BlockedAdvertisersController do
  setup :activate_authlogic

  let(:site_1) { FactoryGirl.create(:site, name: 'Site 1', source_id: "R_#{SecureRandom.uuid}") }
  let(:site_2) { FactoryGirl.create(:site, name: 'Site 2', source_id: "R_#{SecureRandom.uuid}") }
  let(:site_3) { FactoryGirl.create(:site, name: 'Site 3', source_id: "R_#{SecureRandom.uuid}") }
  let(:advertiser_1) { FactoryGirl.create :advertiser, name: 'adveriser_one' }
  let(:advertiser_2) { FactoryGirl.create :advertiser, name: 'adveriser_second' }
  let(:advertiser_3) { FactoryGirl.create :advertiser, name: 'adveriser_third' }

  let(:advertiser_group_1) { FactoryGirl.create :advertiser_block, name: 'adveriser_group_one' }
  let(:advertiser_group_2) { FactoryGirl.create :advertiser_block, name: 'adveriser_group_second' }
  let(:advertiser_group_3) { FactoryGirl.create :advertiser_block, name: 'adveriser_group_third' }

  before :each do
    account = FactoryGirl.create(:account)
    AccountSession.create(account)

    FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_1, site: site_1, state: 'PENDING_BLOCK', user: account.user)
    FactoryGirl.create(:blocked_advertiser, advertiser: advertiser_2, site: site_1, state: 'BLOCK', user: account.user)

    FactoryGirl.create(:blocked_advertiser_group, advertiser_block: advertiser_group_1, site: site_1, state: 'PENDING_BLOCK', user: account.user)
    FactoryGirl.create(:blocked_advertiser_group, advertiser_block: advertiser_group_2, site: site_2, state: 'BLOCK', user: account.user)

    FactoryGirl.create(:default_site_blocks, site: site_2, user: account.user)
  end

  describe "GET 'index'" do
    it "returns http success" do
      get 'index'
      response.should be_success
    end
  end

  describe "GET 'get_blocked_sites_on_advertiser'" do
    it "returns blocked sites for the advertiser" do
      get 'get_blocked_sites_on_advertiser', { format: "json", advertiser_id: "#{advertiser_1.id}, #{advertiser_2.id}, #{advertiser_3.id}"}
      data = JSON.parse(response.body)
      expect(data[0]["advertiser_id"]).to eq advertiser_1.id
      expect(data[1]["advertiser_id"]).to eq advertiser_2.id
      expect(data[2]["advertiser_id"]).to eq advertiser_3.id
      expect(data[2]["default_block"]).to eq true
    end
  end

  describe "GET 'get_blocked_sites_on_advertiser_group'" do
    it "returns blocked sites for the advertiser groups" do
      get 'get_blocked_sites_on_advertiser_group', { format: "json", advertiser_group_id: "#{advertiser_group_1.id}, #{advertiser_group_2.id}, #{advertiser_group_3.id}"}
      data = JSON.parse(response.body)
      expect(data[0]["advertiser_group_id"]).to eq advertiser_group_1.id
      expect(data[1]["advertiser_group_id"]).to eq advertiser_group_2.id
      expect(data[2]["advertiser_group_id"]).to eq advertiser_group_3.id
    end
  end

  describe "GET 'export_blocked_sites_on_advertisers'" do
    it "returns http success" do
      get 'export_blocked_sites_on_advertisers', { format: :xls }
      response.should be_success
    end

    it "send xls file" do
      get 'export_blocked_sites_on_advertisers', { format: :xls, advertiser_id: "#{advertiser_1.id}, #{advertiser_2.id}, #{advertiser_3.id}" }
      expect(response.content_type.to_s).to eq Mime::Type.lookup_by_extension(:xls).to_s
    end

  end

  describe "GET 'export_blocked_sites_on_advertiser_groups'" do
    it "returns http success" do
      get 'export_blocked_sites_on_advertiser_groups', { format: :xls }
      response.should be_success
    end

    it "send xls file" do
      get 'export_blocked_sites_on_advertiser_groups', { format: :xls, advertiser_group_id: "#{advertiser_group_1.id}, #{advertiser_group_2.id}, #{advertiser_group_3.id}" }
      expect(response.content_type.to_s).to eq Mime::Type.lookup_by_extension(:xls).to_s
    end

  end

end
