require 'spec_helper'

describe BlockLog do
  it { should belong_to(:site) }
  it { should belong_to(:user) }
  it { should belong_to(:advertiser) }
  it { should belong_to(:advertiser_block) }

  describe "check block log filters" do
    let(:user) { FactoryGirl.create :user }

    before do
      @block_log1 = FactoryGirl.create :block_log, created_at: 1.day.from_now
      site = FactoryGirl.create :site, source_id: 2
      @block_log2 = FactoryGirl.create :block_log, site: site, created_at: 2.day.from_now
    end

    it "check filter by date" do
      block_logs = BlockLog.includes(:advertiser, :advertiser_block).joins(:site, :user)
             .of_network(user.network)
             .filter_by_date(@block_log1.created_at, @block_log2.created_at)

      block_logs.size.should == 2
    end

    it "check filter by site" do
      block_logs = BlockLog.includes(:advertiser, :advertiser_block).joins(:site, :user)
             .of_network(user.network)
             .filter_by_site(@block_log1.site.name)

      block_logs.first.site.name.should == @block_log1.site.name
    end

    it "check filter by advertiser" do
      block_logs = BlockLog.includes(:advertiser, :advertiser_block).joins(:site, :user)
             .of_network(user.network)
             .filter_by_advertiser(@block_log1.advertiser.name)

      block_logs.first.advertiser.name.should == @block_log1.advertiser.name
    end

    it "check filter by advertiser group" do
      block_logs = BlockLog.includes(:advertiser, :advertiser_block).joins(:site, :user)
             .of_network(user.network)
             .filter_by_advertiser_group(@block_log1.advertiser_block.name)

      block_logs.first.advertiser_block.name.should == @block_log1.advertiser_block.name
    end
  end
end
