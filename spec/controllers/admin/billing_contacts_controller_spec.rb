require 'spec_helper'

describe Admin::BillingContactsController do
  setup :activate_authlogic
  let!(:billing_contact) { FactoryGirl.create(:billing_contact) }

  before :each do
    account = FactoryGirl.create(:account)
    AccountSession.create(account)
  end

  describe "GET 'index'" do
    it "returns http success" do
      get 'index', :id => billing_contact.reach_client_id, :format => 'json'
      response.should be_success
    end

    it "gets billing contacts" do
      get 'index', :id => billing_contact.reach_client_id, :format => 'json'
      assigns(:billing_contacts).should eq([billing_contact])
    end
  end

  describe "POST 'create'" do
    it "creates new billing contact" do
      expect{
        post :create, valid_params
        }.to change(BillingContact,:count).by(1)
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
        params[:id] = billing_contact.id
      end

      it "checks billing contact update" do
        put :update, params

        assigns(:billing_contact).name.should eq(params[:billingContact][:name])
        assigns(:billing_contact).phone.should eq(params[:billingContact][:phone])
        assigns(:billing_contact).email.should eq(params[:billingContact][:email])
      end
    end

    context "updates with invalid params" do
      let(:params) { invalid_params }

      before do
        params[:id] = billing_contact.id
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
        billingContact: {
          name: "Bryan Snyder",
          phone: billing_contact.phone,
          email: billing_contact.email,
          reach_client_id: billing_contact.reach_client_id
        }
      }
      { :format => 'json' }.merge params
    end

    def invalid_params
      params = {
        billingContact: {
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
        billingContact: {
          name: "Addy Earles",
          phone: "7049737346",
          email: "digital.services@twcable.com",
        }
      }
      { :format => 'json' }.merge params
    end
end
