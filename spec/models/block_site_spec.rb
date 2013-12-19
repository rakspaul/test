require 'spec_helper'

describe BlockSite do
  it { should belong_to(:network) }
  it { should belong_to(:user) }
  it { should belong_to(:site) }
end
