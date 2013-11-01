require 'spec_helper'

describe ReachClient do
  it { should belong_to(:media_contact) }
  it { should belong_to(:billing_contact) }
  it { should belong_to(:account_manager) }
  it { should belong_to(:sales_person) }

  it { should validate_presence_of(:name) }
  it { should validate_presence_of(:abbr) }

  it { should validate_presence_of(:network_id) }
end
