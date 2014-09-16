require 'spec_helper'

describe Desk::OrdersController do
  setup :activate_authlogic

  context "index" do
    before :each do
      freeze_time 2.months.ago.beginning_of_day
      #orders created 2 months ago
      @order1 = FactoryGirl.create :order, :start_date => Time.now, :end_date => (2.months + 1.day).from_now
      @order2 = FactoryGirl.create :order, :start_date => Time.now + 1.day, :end_date => (2.months - 1.minute).from_now

      adjust_time 1.month
      #orders created 1 month ago
      @order3 = FactoryGirl.create :order, :start_date => Time.now, :end_date => 2.month.from_now
      @order4 = FactoryGirl.create :order, :start_date => Time.now + 1.day, :end_date => 6.months.from_now

      adjust_time 1.month - 2.weeks
      #orders created 2 week ago
      @order5 = FactoryGirl.create :order, :start_date => Time.now, :end_date => 6.days.from_now
      @order6 = FactoryGirl.create :order, :start_date => Time.now, :end_date => 5.days.from_now

      adjust_time 1.week
      #orders created 1 week ago
      @order7 = FactoryGirl.create :order, :start_date => Time.now, :end_date => 6.days.from_now
      @order8 = FactoryGirl.create :order, :start_date => Time.now, :end_date => 6.months.from_now

      adjust_time 1.week
      #orders created this week
      @order9 = FactoryGirl.create :order, :start_date => Time.now, :end_date => 1.day.from_now
      @order10 = FactoryGirl.create :order, :start_date => Time.now, :end_date => 1.month.from_now

      @account = FactoryGirl.create(:account)
      AccountSession.create(@account)

    end

    it "should assume default date filter - last_week" do
      get 'index', {format: :json}
      response.should be_success

      json = json_parse(response.body)

      json[:total_pages].to_i.should == 2
      json[:orders].map{|o|o.fetch(:id)}.sort.should == [@order2, @order3, @order4, @order7, @order8].map(&:id).sort

      get 'index', {format: :json, page: 2}
      response.should be_success

      json = json_parse(response.body)

      json[:total_pages].to_i.should == 2
      json[:orders].map{|o|o.fetch(:id)}.sort.should == [@order1].map(&:id).sort
    end

    it "should return orders delivering last one month" do
      get 'index', format: :json, filter: {date_filter: 'last_month'}
      response.should be_success

      json = json_parse(response.body)

      json[:total_pages].to_i.should == 2
      json[:orders].map{|o|o.fetch(:id)}.sort.should == [@order4, @order5, @order6, @order7, @order8].map(&:id).sort

      get 'index', format: :json, page: 2, filter: {date_filter: 'last_month'}
      response.should be_success

      json = json_parse(response.body)

      json[:total_pages].to_i.should == 2
      json[:orders].map{|o|o.fetch(:id)}.sort.should == [@order1, @order2, @order3].map(&:id).sort
    end
  end
end