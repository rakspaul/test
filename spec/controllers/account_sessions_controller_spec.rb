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
      response.should redirect_to reports_path
    end
  end

  describe "POST #create" do
    before :each do
      @account = FactoryGirl.create(:account)
    end

    context "valid user" do
      it "should login user" do
        post :create, {:login => @account.login, :password => @account.password}
        response.should redirect_to(reports_path)
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

