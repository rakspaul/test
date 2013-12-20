require 'spec_helper'

describe Admin::AudienceGroupsController do
  setup :activate_authlogic
  let(:audience_group) { FactoryGirl.create(:audience_group) }

  before :each do
    account = FactoryGirl.create(:account)
    AccountSession.create(account)

    FactoryGirl.create(:segment1)
    FactoryGirl.create(:segment2)
    FactoryGirl.create(:context1)
    FactoryGirl.create(:context2)
  end

  describe "GET 'index'" do
    it "returns http success" do
      get 'index'
      response.should be_success
    end

    it "gets audience groups" do
      audience_group = FactoryGirl.create(:audience_group)
      get 'index'
      assigns(:audience_groups).should eq([audience_group])
    end

    it "renders index view" do
      get :index
      response.should render_template :index
    end
  end

  describe "GET 'new'" do
    it "returns http success" do
      get 'new'
      response.should be_success
    end
  end

  describe "GET 'show'" do
    it "returns http success" do
      get 'show', :id => audience_group.id, :format => 'json'
      response.should be_success
    end

    it "get audience group" do
      get 'show', :id => audience_group.id, :format => 'json'
      assigns(:audience_group).should eq(audience_group)
    end
  end

  describe "POST 'create'" do
    it "creates new audience group" do
      expect{
        post :create, valid_params
        }.to change(AudienceGroup,:count).by(1)
    end

    it "checks validation errors" do
      post :create, invalid_params
      data = json_parse(response.body)

      expect(data[:errors]).to include(:name)
      expect(data[:errors]).to include(:key_values)
    end
  end

  describe "PUT 'update'" do
    context "updates with diff params" do
      let(:params) { valid_params_diff }

      before do
        params[:id] = audience_group.id
      end

      it "checks audience group update" do
        put :update, params

        assigns(:audience_group).name.should eq(params[:audienceGroup][:name])
        assigns(:audience_group).key_values.should eq(params[:audienceGroup][:key_values])
      end
    end

    context "updates with invalid params" do
      let(:params) { invalid_params }

      before do
        params[:id] = audience_group.id
      end

      it "checks validation errors" do
        put :update, params
        data = json_parse(response.body)

        expect(data[:errors]).to include(:name)
        expect(data[:errors]).to include(:key_values)
      end
    end
  end

  describe "GET 'edit'" do
    it "returns http success" do
      get 'edit', :id => audience_group.id
      response.should be_success
    end

    it "edit audience group" do
      get 'edit', :id => audience_group.id
      assigns(:audience_group).should eq(audience_group)
    end
  end

private
  def valid_params
    params = {
      audienceGroup: {
        name: audience_group.name,
        key_values: audience_group.key_values,
        network: audience_group.network_id,
        user: audience_group.user_id
      }
    }
    { :format => 'json' }.merge params
  end

  def invalid_params
    params = {
      audienceGroup: {
        name: '',
        key_values: '',
      }
    }
    { :format => 'json' }.merge params
  end

  def valid_params_diff
    params = {
      audienceGroup: {
        name: Faker::Lorem.word,
        key_values: audience_group.key_values,
      }
    }
    { :format => 'json' }.merge params
  end
end