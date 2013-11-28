require 'spec_helper'

describe Advertiser do
  let(:data_source) { DataSource.create name: "Test Source", ident: "source ident" }
  let(:collective_network) { Network.create name: 'Collective', :data_source => data_source }

  before do
    advertiser_type = AdvertiserType.create name: 'ADVERTISER', network: collective_network
    @adv_one = Advertiser.create network_id: collective_network.id, name: "adv1", source_id: '12345', advertiser_type: advertiser_type
  end

  it { should belong_to(:advertiser_type) }

  it 'default scope' do
    adv = Advertiser.find_by_name("adv1")
    adv.advertiser_type.name.should == 'ADVERTISER'
    adv.should eq @adv_one
  end

end
