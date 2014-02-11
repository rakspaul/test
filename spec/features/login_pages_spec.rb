require 'spec_helper'

describe "Login" do
  describe "GET /" do
    it "shows login page" do
      visit root_path

      page.should have_content('Username')
      page.should have_content('Password')
      page.has_field?("login").should be_true
      page.has_field?("password").should be_true
    end

    it "should redirect if session is active" do
      role = FactoryGirl.create(:role)
      valid_user = FactoryGirl.create(:account)
      role.users << valid_user.user

      visit root_path
      fill_in "Username", :with => valid_user.login
      fill_in "Password", :with => valid_user.password
      click_button "Login"
      page.should have_content 'Signout'

      visit root_path
      page.should have_content 'Signout'
    end
  end

  describe "POST /" do

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

    it "should login valid user" do
      valid_user = FactoryGirl.create(:account)

      visit root_path
      fill_in "Username", :with => @account.login
      fill_in "Password", :with => @account.password
      click_button "Login"
      page.should have_content 'Signout'
    end

    it "should not login invalid user" do
      visit root_path
      fill_in "Username", :with => Faker::Internet.user_name
      fill_in "Password", :with => "fake_amp_ui_user"
      click_button "Login"

      page.should have_content "Invalid username/password"
      page.should have_content "Username"
    end
  end
end
