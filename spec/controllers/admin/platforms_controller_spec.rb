require 'spec_helper'

describe Admin::PlatformsController do
  setup :activate_authlogic
  let(:platform) { FactoryGirl.create(:platform) }

  before :each do
    account = FactoryGirl.create(:account)
    AccountSession.create(account)
  end

  describe "GET 'index'" do
    it "returns http success" do
      get 'index'
      response.should be_success
    end

    it "gets platforms" do
      platform = FactoryGirl.create(:platform)
      get 'index'
      assigns(:platforms).should eq([platform])
    end

    it "renders index view" do
      get :index
      response.should render_template :index
    end
  end

  describe "GET 'show'" do
    it "returns http success" do
      get 'show', :id => platform.id, :format => 'json'
      response.should be_success
    end

    it "get platform" do
      get 'show', :id => platform.id, :format => 'json'
      assigns(:platform).should eq(platform)
    end
  end

  describe "POST 'create'" do
    it "creates new platform" do
      expect{
        post :create, valid_params
        }.to change(Platform,:count).by(1)
    end

    it "checks validation for name and media types" do
      expect{
        post :create, valid_params
        }.to change(Platform,:count).by(1)
      expect{
        post :create, valid_params
        }.to change(Platform,:count).by(0)
    end

    it "checks validation errors" do
      post :create, invalid_params
      data = json_parse(response.body)

      expect(data[:errors]).to include(:name)
      expect(data[:errors]).to include(:media_type_id)
      expect(data[:errors]).to include(:dfp_site_name)
      expect(data[:errors]).to include(:priority)
      expect(data[:errors]).to include(:dfp_key)
      expect(data[:errors]).to include(:ad_type)
      expect(data[:errors]).to include(:naming_convention)
    end
  end

  describe "PUT 'update'" do
    context "updates with diff params" do
      let(:params) { diff_params }

      before do
        params[:id] = platform.id
      end

      it "checks platforms update" do
        put :update, params

        assigns(:platform).name.should eq(params[:platform][:name])
        assigns(:platform).dfp_key.should eq(params[:platform][:dfp_key])
        assigns(:platform).naming_convention.should eq(params[:platform][:naming_convention])
        assigns(:platform).ad_type.should eq(params[:platform][:ad_type])
        assigns(:platform).priority.should eq(params[:platform][:priority])
        assigns(:platform).enabled.should eq(params[:platform][:enabled])
        assigns(:platform).media_type_id.should eq(params[:platform][:media_type_id])
        assigns(:platform).tag_template.should eq(params[:platform][:tag_template])
      end
    end
  end
end

private
  def valid_params
    params = {
      platform: {
        name: platform.name,
        dfp_key: platform.dfp_key,
        naming_convention: platform.naming_convention,
        ad_type: platform.ad_type,
        priority: platform.ad_type,
        enabled: platform.enabled,
        media_type_id: platform.media_type_id,
        dfp_site_name: "WRAL",
        tag_template: "http://a.collective-media.net/pfadx/cm.adaptv/!ZONE_NAME!;video=!KEY_VALUE!;sz=!SIZE!;ord=${AdPlayer.cachebreaker};dcmt=text/xml;cmu=${embeddingPageUrl}"
      }
    }
    { :format => 'json' }.merge params
  end

  def invalid_params
    params = {
      platform: {
        name: '',
        dfp_key: '',
        naming_convention: '',
        ad_type: '',
        priority: '',
        enabled: '',
        media_type_id: '',
        dfp_site_name: ''
      }
    }
    { :format => 'json' }.merge params
  end

  def diff_params
    params = {
      platform: {
        name: "Test Platform",
        dfp_key: "video",
        naming_convention: "^mob",
        ad_type: 'Sponsorship',
        priority: rand(0..16),
        enabled: false,
        media_type_id: rand(100..1000),
        dfp_site_name: "facebook",
        tag_template: "http://a.collective-media.net/pfadx/cm.adaptv/!ZONE_NAME!"
      }
    }
    { :format => 'json' }.merge params
  end



