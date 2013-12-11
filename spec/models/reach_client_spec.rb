require 'spec_helper'

describe ReachClient do

  it { should belong_to(:media_contact) }
  it { should belong_to(:billing_contact) }
  it { should belong_to(:account_manager) }
  it { should belong_to(:sales_person) }

  context "Validations" do
    before do
      reach_client = FactoryGirl.create(:reach_client)
    end

    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:abbr) }
    it { should validate_presence_of(:network_id) }
    it { should validate_uniqueness_of(:name).scoped_to(:network_id).case_insensitive  }
    it { should validate_uniqueness_of(:abbr).scoped_to(:network_id).case_insensitive  }
  end
end
