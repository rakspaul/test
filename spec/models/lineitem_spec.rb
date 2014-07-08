require 'spec_helper'

describe Lineitem do
  let(:order) { FactoryGirl.create(:order) }
  let(:lineitem) { FactoryGirl.create(:lineitem, :order => order) }
  let(:lineitem_video) { FactoryGirl.create(:lineitem_video, :order => order) }

  it { lineitem.should allow_value('Display').for(:type) }
  it { lineitem.should allow_value('Video').for(:type) }

  context "Video" do
    it "set default master ad size on create" do
      expect(lineitem_video.ad_sizes).to eq(Video::DEFAULT_MASTER_ADSIZE)
    end

    it "return companion ad size" do
      lineitem_video.ad_sizes = "1x1,160x600,300x250,728x90"
      expect(lineitem_video.companion_ad_size).to eq("160x600,300x250,728x90")
    end
  end

  context "Create" do
    it "should set default buffer value" do
      expect(lineitem.buffer).to eq(5.5)
    end
  end

  context "destroy" do
    let!(:frequency_cap) { FactoryGirl.create :li_frequency_cap, lineitem: lineitem }

    it "should delete related frequency caps" do
      expect { lineitem.destroy }.to change(LineitemFrequencyCap, :count).by(-1)
    end
  end
end
