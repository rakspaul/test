require 'spec_helper'

describe OrdersController do
  setup :activate_authlogic

  let(:reach_client) { FactoryGirl.create(:reach_client) }
  let(:user) { FactoryGirl.singleton(:user) }
  let(:advertiser) { FactoryGirl.singleton(:advertiser) }
  let!(:ad_sizes) { [ FactoryGirl.create(:ad_size_160x600),
                     FactoryGirl.create(:ad_size_300x250),
                     FactoryGirl.create(:ad_size_728x90) ] }
  let(:io_detail) {FactoryGirl.create(:io_detail)}

  before :each do
    account = FactoryGirl.create(:account)
    AccountSession.create(account)

    controller.stub(:store_io_asset).and_return(true)
  end

  describe "GET 'index'" do
    it "returns http success" do
      get 'index'
      response.should be_success
    end
  end

  describe "POST 'create'" do
    context "valid order" do
      it "returns http success" do
        post :create, io_request

        response.should be_success
      end

      it "create a new order" do
        expect{
          post :create, io_request
        }.to change(Order, :count).by(1)
      end

      it "create a new IO detail" do
        expect{
          post :create, io_request
        }.to change(IoDetail, :count).by(1)
      end

      it "create a new billing contact" do
        expect{
          post :create, io_request
        }.to change(BillingContact, :count).by(1)
      end

      it "create a new media contact" do
        expect{
          post :create, io_request
        }.to change(MediaContact, :count).by(1)
      end

      it "create a new lineitem" do
        expect{
          post :create, io_request
        }.to change(Lineitem, :count).by(1)
      end

      it "create a new creatives" do
        expect{
          post :create, io_request
        }.to change(Creative, :count).by(3)
      end

      it "saves creatives with name = ad description + creative's ad_size" do
        post :create, io_request_w_ads
        Order.last.ads.each do |ad|
          ad.creatives.each do |creative|
            ad_description = ad.description.gsub(/\s*\d+x\d+,?/, '')
            expect(creative.name).to start_with(ad_description)
          end
        end
      end

      it "create a new order note" do
        expect{
          post :create, io_request
        }.to change(OrderNote, :count).by(2)
      end
    end

    context "invalid order" do
      let(:params) { io_request }

      it "return reach client error" do
        params['order']['reach_client_id'] = false
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors]).to include(:reach_client)
      end

      it "return trafficking contact error" do
        params['order']['trafficking_contact_id'] = false
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors]).to include(:trafficking_contact)
      end

      it "return sales person error" do
        params['order']['sales_person_name'] = ''
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors]).to include(:sales_person)
      end

      it "return account manager error" do
        params['order']['account_contact_name'] = ''
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors]).to include(:account_manager)
      end

      it "return order name error" do
        order = FactoryGirl.create(:order)
        params['order']['name'] = order.name
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors]).to include(:name)
      end

      it "return lineitems errors" do
        order = FactoryGirl.create(:order)
        params['order']['lineitems'].each do |li|
          li['lineitem']['start_date'] = 21.day.ago.strftime('%Y-%m-%d')
          li['lineitem']['end_date']   = 1.day.ago.strftime('%Y-%m-%d')
        end
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors][:lineitems]['0'][:lineitems]).to include(:start_date)
      end

      it "return error on invalid keyvalue targeting on ad level" do
        params = io_request_w_ads

        {'btg' => "Key value format should be [key]=[value]", 'btg=123 bth=33' => "Key values should be comma separated"}.each do |error_request, error_response|
          params['order']['lineitems'].each do |li|
            li['ads'].each do |ad|
              ad['ad']['targeting']['targeting']['keyvalue_targeting'] = error_request
            end
          end

          expect{
            post :create, params
          }.to change(Order, :count).by(0)

          data = json_parse(response.body)
          expect(data[:errors][:lineitems]['0'][:ads]['0'][:targeting]).to include(error_response)
        end
      end

      it "return error on invalid keyvalue targeting on lineitem level" do
        params = io_request_w_ads

        {'btg' => "Key value format should be [key]=[value]", 'btg=123 bth=33' => "Key values should be comma separated"}.each do |error_request, error_response|
          params['order']['lineitems'].each do |li|
            li['lineitem']['targeting']['targeting']['keyvalue_targeting'] = error_request
          end

          expect{
            post :create, params
          }.to change(Order, :count).by(0)

          data = json_parse(response.body)
          expect(data[:errors][:lineitems]['0'][:targeting]).to include(error_response)
        end
      end
    end

    context "ads" do
      let(:params) { io_request_w_ads }

      it "create new ads" do
        expect{
          post :create, params
        }.to change(Ad, :count).by(1)
      end

      it "create companion ad for video lineitem" do
        params['order']['lineitems'].each do |li|
          li['ads'].each do |ad|
            ad['ad']['type'] = 'Companion'
          end
        end
        media_type = user.network.media_types.where(:category => 'Display').first
        post :create, params
        expect(Ad.last.media_type_id).to eq(media_type.id)
      end

      it "create ad with SPONSORSHIP ad type for mobile ad" do
        params['order']['lineitems'].each do |li|
          li['ads'].each do |ad|
            ad['ad']['type'] = 'Mobile'
          end
        end
        post :create, params
        expect(Ad.last.ad_type).to eq('SPONSORSHIP')
      end
    end
  end

  describe "DELETE 'destroy'" do
    before :each do
      @order = FactoryGirl.create :order, name: 'testOrder', io_detail: io_detail
    end

    it "returns http success" do
      delete :delete, ids: @order

      response.should be_success
    end

    it "deletes the order" do
      expect{
        delete :delete, ids: @order
      }.to change(Order,:count).by(-1)
    end

    it "deletes the advertiser" do
      expect{
        delete :delete, ids: @order
      }.to change(Advertiser,:count).by(-1)
    end

    it "should not delete advertiser if more than one orders associated" do
      order_one = FactoryGirl.create :order, name: 'order_one', network_advertiser_id: advertiser.id, io_detail: io_detail
      order_two = FactoryGirl.create :order, name: 'order_two', network_advertiser_id: advertiser.id, io_detail: io_detail

      expect{
        delete :delete, ids: order_one
      }.to change(Advertiser,:count).by(0)
    end
  end

private
  def io_request
    params = JSON.parse(File.read( Rails.root.join('spec', 'fixtures', 'requests', 'valid_io.json')))

    user_name = "#{user.first_name} #{user.last_name}"
    start_date = 1.day.from_now.strftime('%Y-%m-%d')
    end_date   = 22.day.from_now.strftime('%Y-%m-%d')

    params['order']['reach_client_id']        = reach_client.id
    params['order']['trafficking_contact_id'] = user.id
    params['order']['sales_person_name']      = user_name
    params['order']['account_contact_name']   = user_name
    params['order']['start_date'] = start_date
    params['order']['end_date'] = end_date
    params['order']['advertiser_id'] = advertiser.id
    params['order']['lineitems'].each do |li|
      li['lineitem']['start_date'] = start_date
      li['lineitem']['end_date']   = end_date
      li['lineitem']['creatives'].each do |creative|
        creative['creative']['start_date'] = start_date
        creative['creative']['end_date']   = end_date
      end
    end

   { :format => 'json' }.merge params
  end

  def io_request_w_ads
    params = JSON.parse(File.read( Rails.root.join('spec', 'fixtures', 'requests', 'valid_io_w_ads.json')))

    user_name = "#{user.first_name} #{user.last_name}"
    start_date = 1.day.from_now.strftime('%Y-%m-%d')
    end_date   = 22.day.from_now.strftime('%Y-%m-%d')

    params['order']['reach_client_id']        = reach_client.id
    params['order']['trafficking_contact_id'] = user.id
    params['order']['sales_person_name']      = user_name
    params['order']['account_contact_name']   = user_name
    params['order']['start_date'] = start_date
    params['order']['end_date'] = end_date
    params['order']['advertiser_id'] = advertiser.id
    params['order']['lineitems'].each do |li|
      li['lineitem']['start_date'] = start_date
      li['lineitem']['end_date']   = end_date
      li['lineitem']['creatives'].each do |creative|
        creative['creative']['start_date'] = start_date
        creative['creative']['end_date']   = end_date
      end

      li['ads'].each do |ad|
        ad['ad']['start_date'] = start_date
        ad['ad']['end_date'] = end_date
        ad['ad']['creatives'].each do |creative|
          creative['creative']['start_date'] = start_date
          creative['creative']['end_date']   = end_date
        end
        ad['ad']['type'] = 'Video'
      end
    end

   { :format => 'json' }.merge params
  end
end
