require 'spec_helper'

describe Advertiser do
  let(:data_source) { DataSource.create name: "Test Source", ident: "source ident" }
  let(:collective_network) { Network.create name: 'Collective', :data_source => data_source }

  before do
    advertiser_type1 = AdvertiserType.create name: 'ADVERTISER', network: collective_network
    advertiser_type2 = AdvertiserType.create name: 'HOUSEADVERTISER', network: collective_network
    advertiser_type3 = AdvertiserType.create name: 'AGENCY', network: collective_network

    @adv_one = Advertiser.create network_id: collective_network.id, name: "adv1", source_id: '12345', advertiser_type: advertiser_type1
    adv_two = Advertiser.create network_id: collective_network.id, name: "adv2", source_id: '23456', advertiser_type: advertiser_type2
    adv_three = Advertiser.create network_id: collective_network.id, name: "adv3", source_id: '34567', advertiser_type: advertiser_type3
  end

  it { should belong_to(:advertiser_type) }

  it 'default scope' do
    adv = Advertiser.find_by_name("adv1")
    adv.advertiser_type.name.should == 'ADVERTISER'
    adv.should eq @adv_one
  end

  it 'return only ADVERTISER type of Advertisers' do
    adv = Advertiser.all
    adv.size.should == 1
    adv.first.advertiser_type.name.should == 'ADVERTISER'
  end

end
