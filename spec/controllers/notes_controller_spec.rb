require 'spec_helper'

describe OrderNotesController do
  setup :activate_authlogic

  let(:user) { FactoryGirl.create :user }
  let(:advertiser) { FactoryGirl.create :advertiser, network: user.network }

  before :each do
    account = FactoryGirl.create(:account)
    AccountSession.create(account)
  end

  context "new note" do
    before do
      @order_name = "Rodenbaugh's on Audience Network / TWCC (10/3 - 12/29/13) - 788977"
      @order = Order.create user_id: user.id, network: user.network, network_advertiser_id: advertiser.id, start_date: (Time.current + 1.day), end_date: (Time.current + 12.days), name: @order_name
      @user_to_notify = FactoryGirl.create :user, first_name: "Dmitrii", last_name: "Samoilov", email: "dsamoilov@cogniance.com"
      @note_body = "test"
    end

    it "creates new note successfully" do
      expect {
        xhr :post, :create, {note: @note_body, username: "Amol Brid", order_id: @order.id, order_note: {note: "test"}}
      }.to change(OrderNote, :count).by(1)
    end

    it "creates new note and notifies user" do
      expect {
        expect {
          xhr :post, :create, {note: @note_body, username: "Amol Brid", notify_users: [@user_to_notify.email], order_id: @order.id, order_note: {note: "test"}}
        }.to change(OrderNote, :count).by(1)
      }.to change(ActionMailer::Base.deliveries, :count).by(1)

      email = ActionMailer::Base.deliveries.last
      email.to.should == [@user_to_notify.email]
      email.subject.should match(Regexp.escape(@order_name))
      email.body.should match(Regexp.new(@note_body))
    end
  end
end
