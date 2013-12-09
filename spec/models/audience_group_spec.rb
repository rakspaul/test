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

    before do
      subject.network = FactoryGirl.singleton(:network)
      subject.config = stub("config", search_segments_in_network: subject.network.id.to_s,
        search_contexts_in_network: subject.network.id.to_s)
      subject.name = 'test'
    end

    it "should validate missing key" do
      subject.key_values = '=cm.89'

      subject.valid?
      subject.errors.messages[:key_values].should include "Missing key for the value cm.89"
    end

    it "should validate missing value" do
      subject.key_values = 'btg='
      subject.valid?
      subject.errors.messages[:key_values].should include "Missing value for the key btg"
    end

    it "should validate only 'btg' and 'contx' keys" do
      subject.key_values = 'key=abc'
      subject.valid?
      subject.errors.messages[:key_values].should include "Invalid key for the value abc"
    end

    it "should validate segment not found" do
      subject.key_values = 'btg=cm.04'
      subject.valid?
      subject.errors.messages[:key_values].should include "btg=cm.04 segment(s) does not exist."
    end

    it "should validate context not found" do
      subject.key_values = 'contx=auto'
      subject.valid?
      subject.errors.messages[:key_values].should include "contx=auto context(s) does not exist."
    end
  end
end
