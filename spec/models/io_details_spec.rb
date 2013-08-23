require 'spec_helper'

describe IoDetail do
  it { should belong_to(:media_contact) }

  it { should belong_to(:billing_contact) }

  it { should belong_to(:trafficking_contact) }

  it { should belong_to(:account_manager) }

  it { should belong_to(:sales_person) }

  it { should belong_to(:reach_client) }

  it { should belong_to(:order) }
end
