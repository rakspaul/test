require 'spec_helper'

describe Platform do
  it { should belong_to(:network) }

  it { should belong_to(:media_type) }

  it { should belong_to(:site) }
end
