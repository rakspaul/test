require 'spec_helper'

describe BillingContact do
  it { should have_many(:reach_clients) }
  it { should validate_presence_of(:phone) }
  it { should validate_presence_of(:reach_client_id) }

  it { should_not allow_value("blah").for(:email) }
  it { should_not allow_value("blah@").for(:email) }
  it { should_not allow_value("blah@example").for(:email) }
  it { should allow_value("a@b.com").for(:email) }
end
