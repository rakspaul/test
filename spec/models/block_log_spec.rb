require 'spec_helper'

describe BlockLog do
  it { should belong_to(:site) }
  it { should belong_to(:user) }
  it { should belong_to(:advertiser) }
  it { should belong_to(:advertiser_block) }
end
