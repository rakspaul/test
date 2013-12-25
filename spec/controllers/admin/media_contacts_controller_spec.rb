require 'spec_helper'

describe Admin::MediaContactsController do
  setup :activate_authlogic
  let!(:media_contact) { FactoryGirl.create(:media_contact) }

  before :each do
    account = FactoryGirl.create(:account)
    AccountSession.create(account)
  end

  describe "GET 'index'" do
    it "returns http success" do
      get 'index', :id => media_contact.reach_client_id, :format => 'json'
      response.should be_success
    end

    it "gets media contacts" do
      get 'index', :id => media_contact.reach_client_id, :format => 'json'
      assigns(:media_contacts).should eq([media_contact])
    end
  end

  describe "POST 'create'" do
    it "creates new media contact" do
      expect{
        post :create, valid_params
        }.to change(MediaContact,:count).by(1)
    end

    it "checks validation errors" do
      post :create, invalid_params
      data = json_parse(response.body)

      expect(data[:errors]).to include(:name)
      expect(data[:errors]).to include(:email)
    end
  end

  describe "PUT 'update'" do
    context "updates with diff params" do
      let(:params) { diff_params }

      before do
        params[:id] = media_contact.id
      end

      it "checks media contact update" do
        put :update, params

        assigns(:media_contact).name.should eq(params[:mediaContact][:name])
        assigns(:media_contact).phone.should eq(params[:mediaContact][:phone])
        assigns(:media_contact).email.should eq(params[:mediaContact][:email])
      end
    end

    context "updates with invalid params" do
      let(:params) { invalid_params }

      before do
        params[:id] = media_contact.id
      end

      it "checks validation errors" do
        put :update, params
        data = json_parse(response.body)

        expect(data[:errors]).to include(:name)
        expect(data[:errors]).to include(:email)
      end
    end
  end

  private
    def valid_params
      params = {
        mediaContact: {
          name: "Addy Earles",
          phone: media_contact.phone,
          email: media_contact.email,
          reach_client_id: media_contact.reach_client_id
        }
      }
      { :format => 'json' }.merge params
    end

    def invalid_params
      params = {
        mediaContact: {
          name: '',
          phone: '',
          email: '',
          reach_client_id: ''
        }
      }
      { :format => 'json' }.merge params
    end

    def diff_params
      params = {
        mediaContact: {
          name: "Bryan Snyder",
          phone: "7049737346",
          email: "digital.services@twcable.com",
        }
      }
      { :format => 'json' }.merge params
    end
end
