require 'spec_helper'

describe Parsers::CoxCreative do
  let(:file) { Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Cox_creatives.txt') }
  #let(:data_source) { DataSource.create name: "Test Source", ident: "source ident" }
  #let(:collective_network) { Network.create name: 'Collective', :data_source => data_source }
  #let(:current_user) { FactoryGirl.create(:user, :network => collective_network) }
  let(:io_creatives) { Parsers::CoxCreative.new file }

  it 'should parse text document' do
    puts io_creatives.inspect
    io_creatives.parse
  end
 
end
