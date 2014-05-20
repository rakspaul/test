require 'spec_helper'

describe Team do
  describe "validations" do
    it "should check the name presence" do
      team = Team.new
      team.save

      team.errors[:name].first.should == "can't be blank"
    end

    it "should check the uniqueness of team name" do
      team = Team.new(:name => 'Test')

      team.new_record?.should be_true
      team.save
      team.new_record?.should be_false

      team1 = Team.new(:name => 'Test')

      team1.new_record?.should be_true
      team1.save
      team1.errors[:name].first.should == "has already been taken"
    end
  end

  describe "users" do
    it "should create users" do
      team = FactoryGirl.create(:team_with_user)
      team.users.size.should == 1
    end
  end
end
