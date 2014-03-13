require 'spec_helper'

describe Admin::ReachClientsController do
  setup :activate_authlogic
  let(:reach_client) { FactoryGirl.create(:reach_client) }

  before :each do
    account = FactoryGirl.create(:account)
    AccountSession.create(account)
  end

  describe "GET 'index'" do
    it "returns http success" do
      get 'index'
      response.should be_success
    end

    it "gets reach clients" do
      reach_client = FactoryGirl.create(:reach_client)
      get 'index'
      assigns(:reach_clients).should eq([reach_client])
    end

    it "renders index view" do
      get :index
      response.should render_template :index
    end
  end

  describe "GET 'show'" do
    it "returns http success" do
      get 'show', :id => reach_client.id, :format => 'json'
      response.should be_success
    end

    it "get reach client" do
      get 'show', :id => reach_client.id, :format => 'json'
      assigns(:reach_client).should eq(reach_client)
    end
  end

  describe "POST 'create'" do
    it "creates new reach client" do
      expect{
        post :create, valid_params
        }.to change(ReachClient,:count).by(1)
    end

    it "checks validation errors" do
      post :create, invalid_params
      data = json_parse(response.body)

      expect(data[:errors]).to include(:name)
      expect(data[:errors]).to include(:abbr)
      expect(data[:errors]).to include(:sales_person_id)
      expect(data[:errors]).to include(:account_manager_id)
      expect(data[:errors]).to include(:agency_id)
      expect(data[:errors]).to include(:client_buffer)
    end
  end

  describe "PUT 'update'" do
    context "updates with diff params" do
      let(:params) { diff_params }

      before do
        params[:id] = reach_client.id
        params[:reachClient].merge! diff_media_billing_params[:reachClient]
      end

      it "checks reach client update" do
        put :update, params

        assigns(:reach_client).name.should eq(params[:reachClient][:name])
        assigns(:reach_client).abbr.should eq(params[:reachClient][:abbr])
        assigns(:reach_client).sales_person_id.should eq(params[:reachClient][:sales_person_id])
        assigns(:reach_client).account_manager_id.should eq(params[:reachClient][:account_manager_id])
        assigns(:reach_client).media_contact_id.should eq(params[:reachClient][:media_contact_id])
        assigns(:reach_client).billing_contact_id.should eq(params[:reachClient][:billing_contact_id])
        assigns(:reach_client).agency_id.should eq(params[:reachClient][:agency_id])
        assigns(:reach_client).client_buffer.should eq(params[:reachClient][:client_buffer])
      end
    end

    context "updates with invalid params" do
      let(:params) { invalid_params }

      before do
        params[:id] = reach_client.id
        params[:reachClient].merge! invalid_media_billing_params[:reachClient]
      end

      it "checks validation errors" do
        put :update, params
        data = json_parse(response.body)

        expect(data[:errors]).to include(:name)
        expect(data[:errors]).to include(:abbr)
        expect(data[:errors]).to include(:sales_person_id)
        expect(data[:errors]).to include(:account_manager_id)
        expect(data[:errors]).to include(:media_contact_id)
        expect(data[:errors]).to include(:billing_contact_id)
        expect(data[:errors]).to include(:agency_id)
        expect(data[:errors]).to include(:client_buffer)
      end
    end
  end

private
  def valid_params
    params = {
      reachClient: {
        name: reach_client.name,
        abbr: reach_client.abbr,
        sales_person_id: reach_client.sales_person_id,
        account_manager_id: reach_client.account_manager_id,
        agency_id: reach_client.agency_id,
        client_buffer: reach_client.client_buffer
      }
    }
    { :format => 'json' }.merge params
  end

  def invalid_params
    params = {
      reachClient: {
        name: '',
        abbr: '',
        sales_person_id: '',
        account_manager_id: '',
        agency_id: '',
        client_buffer: ''
      }
    }
    { :format => 'json' }.merge params
  end

  def diff_params
    params = {
      reachClient: {
        name: Faker::Lorem.word,
        abbr: Faker::Lorem.word,
        sales_person_id: rand(1000..2000),
        account_manager_id: rand(1000..2000),
        agency_id: rand(1000..2000),
        client_buffer: 50.5
      }
    }
    { :format => 'json' }.merge params
  end

  def media_billing_params
    params = {
      reachClient:{
        media_contact_id: FactoryGirl.singleton(:media_contact).id,
        billing_contact_id: FactoryGirl.singleton(:billing_contact).id
      }
    }
  end

  def invalid_media_billing_params
    params = {
      reachClient:{
        media_contact_id: '',
        billing_contact_id: ''
      }
    }
  end

  def diff_media_billing_params
    params = {
      reachClient:{
        media_contact_id: rand(1000..2000),
        billing_contact_id: rand(1000..2000)
      }
    }
  end
end