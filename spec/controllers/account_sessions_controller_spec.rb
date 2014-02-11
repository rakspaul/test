require 'spec_helper'

describe AccountSessionsController do

  describe "GET #new" do
    before :each do
      activate_authlogic
    end

    it "should render login page" do
      get :new

      response.should render_template :new
    end

    it "should redirect to dashboad index for already logged-in user" do
      account = FactoryGirl.create(:account)
      AccountSession.create(account)

      get :new
      response.should redirect_to orders_path
    end
  end

  describe "POST #create" do
    before :each do
      @role = FactoryGirl.create(:role)

      @agency = FactoryGirl.create(:agency)
      @agency_user = FactoryGirl.create(:user, client_type: "Agency")
      @agency.users << @agency_user

      @reach_client = FactoryGirl.create(:reach_client, agency: @agency)

      @account = FactoryGirl.create(:account)
      @agency_account = FactoryGirl.create(:account, user: @agency_user)

      @role.users << @account.user
      @role.users << @agency_account.user
    end

    context "valid user" do
      it "should login user" do
        post :create, {:login => @account.login, :password => @account.password}
        response.should redirect_to(orders_path)
        account_session = AccountSession.find
        account_session.should_not be_nil
      end
    end

    context "valid agency user" do
      it "should login agency user" do
        post :create, {:login => @agency_account.login, :password => @agency_account.password}
        response.should redirect_to(orders_path)
        account_session = AccountSession.find
        account_session.should_not be_nil
      end
    end

    context "invalid user" do
      it "should not login user" do
        post :create, {:login => @account.login, :password => "invlid"}
        account_session = AccountSession.find
        account_session.should be_nil
        response.should render_template :new
      end
    end
  end

  describe "POST #delete" do
    before :each do
      activate_authlogic
      @account = FactoryGirl.create(:account)
    end

    it "should logout user" do
      AccountSession.create(@account)
      AccountSession.find.should_not be_nil

      delete :destroy
      AccountSession.find.should be_nil
      response.should redirect_to root_path
    end
  end
end

