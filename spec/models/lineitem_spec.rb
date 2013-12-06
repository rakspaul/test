require 'spec_helper'

describe Lineitem do
  let(:order) { FactoryGirl.create(:order) }
  let(:lineitem) { FactoryGirl.create(:lineitem, :order => order) }
  let(:lineitem_video) { FactoryGirl.create(:lineitem_video, :order => order) }
  let!(:ad_sizes) { [ FactoryGirl.create(:ad_size_1x1),
                      FactoryGirl.create(:ad_size_160x600),
                      FactoryGirl.create(:ad_size_300x250),
                      FactoryGirl.create(:ad_size_728x90) ] }

  it { lineitem.should allow_value('Display').for(:type) }
  it { lineitem.should allow_value('Video').for(:type) }

  context "Video" do
    it "set default master ad size on create" do
      expect(lineitem_video.ad_sizes).to eq(Video::DEFAULT_MASTER_ADSIZE)
    end
  end
end
