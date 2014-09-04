require 'spec_helper'

describe Desk::OrdersController do
  setup :activate_authlogic

  context "index" do
    before :each do
      freeze_time 2.months.ago.beginning_of_day
      # puts Time.now.to_date
      # puts "start_date: #{Time.now.to_date} end_date: #{(2.months + 1.day).from_now.to_date}"
      # puts "start_date: #{Time.now.to_date} end_date: #{(2.months - 1.minute).from_now.to_date}"
      #orders created 2 months ago
      @order1 = FactoryGirl.create :order, :start_date => Time.now, :end_date => (2.months + 1.day).from_now
      @order2 = FactoryGirl.create :order, :start_date => Time.now, :end_date => (2.months - 1.minute).from_now

      adjust_time 1.month
      # puts Time.now.to_date
      # puts "start_date: #{Time.now.to_date} end_date: #{2.month.from_now.to_date}"
      # puts "start_date: #{Time.now.to_date} end_date: #{6.months.from_now.to_date}"
      #orders created 1 month ago
      @order3 = FactoryGirl.create :order, :start_date => Time.now, :end_date => 2.month.from_now
      @order4 = FactoryGirl.create :order, :start_date => Time.now, :end_date => 6.months.from_now


      adjust_time 1.month - 1.week
      # puts Time.now.to_date
      # puts "start_date: #{Time.now.to_date} end_date: #{6.days.from_now.to_date}"
      # puts "start_date: #{Time.now.to_date} end_date: #{6.months.from_now.to_date}"
      #orders created 1 week ago
      @order5 = FactoryGirl.create :order, :start_date => Time.now, :end_date => 6.days.from_now
      @order6 = FactoryGirl.create :order, :start_date => Time.now, :end_date => 6.months.from_now

      adjust_time 1.week
      # puts Time.now.to_date
      # puts "start_date: #{Time.now.to_date} end_date: #{1.day.from_now.to_date}"
      # puts "start_date: #{Time.now.to_date} end_date: #{1.month.from_now.to_date}"
      #orders created this week
      @order7 = FactoryGirl.create :order, :start_date => Time.now, :end_date => 1.day.from_now
      @order8 = FactoryGirl.create :order, :start_date => Time.now, :end_date => 1.month.from_now

      @account = FactoryGirl.create(:account)
      AccountSession.create(@account)

    end

    it "should return all the orders last week" do
      get 'index', {format: :json}
      response.should be_success

      json = json_parse(response.body)
      json[:orders].map{|o|o.fetch(:id)}.sort.should == [@order2, @order3, @order4, @order5, @order6].map(&:id).sort
    end
  end
end