require 'spec_helper'

describe AudienceGroup do
  it { should belong_to(:network) }
  it { should belong_to(:user) }
  it { should have_and_belong_to_many(:lineitems).with_foreign_key(:reach_audience_group_id) }
  it { should have_and_belong_to_many(:ads).with_foreign_key(:reach_audience_group_id) }

  it { should validate_uniqueness_of(:name).with_message('already exist') }

  it { should validate_presence_of(:name) }
  it { should validate_presence_of(:key_values) }

  describe " validate key values" do
    let(:audience_group1) { AudienceGroup.new(key_values: 'btg=cm.34,=cm.89,btg=,contx=auto', name: 'test') }

    before do
      Rails.application.config.stub(:search_contexts_in_network).and_return(FactoryGirl.singleton(:network).id.to_s)
      Rails.application.config.stub(:search_segments_in_network).and_return(FactoryGirl.singleton(:network).id.to_s)
    end

    it "should validate missing key" do
      audience_group = AudienceGroup.new(key_values: '=cm.89', name: 'test')
      audience_group.valid?
      audience_group.errors.messages[:key_values].should include "Missing key for the value cm.89"
    end

    it "should validate missing value" do
      audience_group = AudienceGroup.new(key_values: 'btg=', name: 'test')
      audience_group.valid?
      audience_group.errors.messages[:key_values].should include "Missing value for the key btg"
    end

    it "should validate only 'btg' and 'contx' keys" do
      audience_group = AudienceGroup.new(key_values: 'key=abc', name: 'test')
      audience_group.valid?
      audience_group.errors.messages[:key_values].should include "Invalid key for the value abc"
    end

    it "should validate segment not found" do
      audience_group = AudienceGroup.new(key_values: 'btg=cm.04', name: 'test')
      audience_group.valid?
      audience_group.errors.messages[:key_values].should include "btg=cm.04 segment(s) does not exist."
    end

    it "should validate context not found" do
      audience_group = AudienceGroup.new(key_values: 'contx=auto', name: 'test', network: FactoryGirl.singleton(:network))
      audience_group.valid?
      audience_group.errors.messages[:key_values].should include "contx=auto context(s) does not exist."
    end
  end
end
