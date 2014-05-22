require 'spec_helper'

describe Task do
  describe "validations" do
    it "should validate the task_state, assignable" do
      task = FactoryGirl.create(:task)
      task.task_state = 'test'
      task.save

      task.errors[:task_state].first.should == 'is not included in the list'

      # validate the default assignee
      task.assignable.nil?.should be_false
      task.assignable_id.nil?.should be_false
      task.assignable_type.nil?.should be_false
      task.assignable.is_a?(Team).should be_true

      team = FactoryGirl.create(:team)
      task = FactoryGirl.create(:task, :assignable => team)
      task.assignable_id.should == team.id

      user = FactoryGirl.create(:user)
      task = FactoryGirl.create(:task, :assignable => user)
      task.assignable_id.should == user.id
      task.assignable_type.should == 'User'
      task.assignable.is_a?(User).should be_true
    end

    it "due date can't be in the past" do
      task = FactoryGirl.create(:task)
      task.due_date = 1.week.ago
      task.save

      task.errors[:due_date].first.should == 'should be future date'
    end
  end
end