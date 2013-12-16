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
    context "valid reach client params" do
      it "creates a new reach client" do
        expect{
          post :create, reach_client_params
          }.to change(ReachClient,:count).by(1)
      end
    end

    context "invalid reach client params" do
      let(:params) { reach_client_params }

      it "name error" do
        params[:reachClient][:name] =''
        post :create, params
        data = json_parse(response.body)
        expect(data[:errors]).to include(:name)
      end

      it "abbr error" do
        params[:reachClient][:abbr] =''
        post :create, params
        data = json_parse(response.body)
        expect(data[:errors]).to include(:abbr)
      end

      it "sales_person_id error" do
        params[:reachClient][:sales_person_id] = ''
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors]).to include(:sales_person_id)
      end

      it "account_manager_id error" do
        params[:reachClient][:account_manager_id] = ''
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors]).to include(:account_manager_id)
      end
    end
  end

  describe "PUT 'update'" do
    let(:params) { reach_client_params }

    it "updates reach client" do
      params[:id] = reach_client.id
      params[:media_contact_id] = FactoryGirl.create(:media_contact).id
      params[:billing_contact_id] = FactoryGirl.create(:billing_contact).id
      put :update, params
      assigns(:reach_client).should eq(reach_client)
    end

    it "reach clients count" do
      params[:id] = reach_client.id
      expect{
        put :update, params
        }.to change(ReachClient,:count).by(0)
    end

    it "updates reach client with diff attr" do
      params[:id] = reach_client.id
      params[:reachClient][:name] = "Test Reach Client Name New"
      params[:reachClient][:abbr] = "TRCNN"

      put :update, params
      assigns(:reach_client).name.should eq("Test Reach Client Name New")
      assigns(:reach_client).abbr.should eq("TRCNN")
    end
  end
end

private
  def reach_client_params
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