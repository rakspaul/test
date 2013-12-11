require 'spec_helper'

describe BlockedAdvertiser do
  specify { BlockedAdvertiser.should < BlockSite }
  it { should belong_to(:advertiser) }
end
