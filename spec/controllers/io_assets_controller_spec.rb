require 'spec_helper'

describe IoAssetsController do
  setup :activate_authlogic

  let(:order) { FactoryGirl.create(:order, name: 'Test xls serve', io_assets: [
    FactoryGirl.create(:io_asset)
  ])}

  before do
    account = FactoryGirl.create(:account)
    AccountSession.create(account)
  end

  describe "GET 'serve'" do
    context "valid io order" do

      it "return http success" do
        get 'serve', { order_id: order.id, format: :xls }
        expect(response).to be_success
      end

      it "send xls file" do
        get 'serve', { order_id: order.id, format: :xls }
        expect(response.content_type.to_s).to eq Mime::Type.lookup_by_extension(:xls).to_s
      end
    end
  end
                        
end
