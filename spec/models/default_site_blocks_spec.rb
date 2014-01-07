require 'spec_helper'

describe DefaultSiteBlocks do
  it { should belong_to(:network) }
  it { should belong_to(:user) }
  it { should belong_to(:site) }
end
