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
    context "post with valid params" do
      it "creates a new reach client" do
        expect{
          post :create, valid_params
          }.to change(ReachClient,:count).by(1)
      end
    end

    context "post with invalid params" do
      let(:params) { invalid_params }

      it "checks validation errors" do
        post :create, invalid_params
        data = json_parse(response.body)

        expect(data[:errors]).to include(:name)
        expect(data[:errors]).to include(:abbr)
        expect(data[:errors]).to include(:sales_person_id)
        expect(data[:errors]).to include(:account_manager_id)
      end
    end
  end

  describe "PUT 'update'" do
    context "update with valid params" do
      let(:params) { valid_params }

      before do
        params[:id] = reach_client.id
        params[:reachClient].merge! media_billing_params[:reachClient]
      end

      it "updates reach client" do
        put :update, params
        assigns(:reach_client).should eq(reach_client)
      end
    end

    context "updates with diff params" do
      let(:params) { diff_attr_params }

      before do
        params[:id] = reach_client.id
        params[:reachClient].merge! diff_media_billing_params[:reachClient]
      end

      it "updates reach client with diff attr" do
        put :update, params

        assigns(:reach_client).name.should eq(params[:reachClient][:name])
        assigns(:reach_client).abbr.should eq(params[:reachClient][:abbr])
        assigns(:reach_client).sales_person_id.should eq(params[:reachClient][:sales_person_id])
        assigns(:reach_client).account_manager_id.should eq(params[:reachClient][:account_manager_id])
        assigns(:reach_client).media_contact_id.should eq(params[:reachClient][:media_contact_id])
        assigns(:reach_client).billing_contact_id.should eq(params[:reachClient][:billing_contact_id])
      end
    end

    context "update with invalid params" do
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
      end
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
      }
    }
    { :format => 'json' }.merge params
  end

  def diff_attr_params
    params = {
      reachClient: {
        name: "_#{reach_client.name}",
        abbr: "_#{reach_client.abbr}",
        sales_person_id: 2,
        account_manager_id: 2,
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
        media_contact_id: 2,
        billing_contact_id: 2
      }
    }
  end
