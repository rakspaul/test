require 'spec_helper'

describe Agency do
  it { should belong_to(:network) }
end
