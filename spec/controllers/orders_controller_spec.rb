require 'spec_helper'

describe OrdersController do
  setup :activate_authlogic

  let(:reach_client) { FactoryGirl.create(:reach_client) }
  let(:user) { FactoryGirl.singleton(:user) }
  let(:advertiser) { FactoryGirl.singleton(:advertiser) }
  let!(:ad_sizes) { [ FactoryGirl.create(:ad_size_160x600),
                     FactoryGirl.create(:ad_size_300x250),
                     FactoryGirl.create(:ad_size_728x90) ] }

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

      it "create a new order note" do
        expect{
          post :create, io_request
        }.to change(OrderNote, :count).by(1)
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
end
