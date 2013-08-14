require 'spec_helper'

describe ReachClient do
  it { should have_many(:io_details) }

  it { should have_one(:media_contact) }

  it { should have_one(:billing_contact) }

  it { should belong_to(:trafficking_contact) }

  it { should belong_to(:account_manager) }

  it { should belong_to(:sales_person) }

  it { should validate_presence_of(:name) }
  it { should validate_presence_of(:abbr) }
  it { should validate_presence_of(:address) }
  it { should validate_presence_of(:network_id) }
end
