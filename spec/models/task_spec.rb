require 'spec_helper'

describe Task do
  describe "validations" do
    it "should validate the task_state" do
      task = FactoryGirl.create(:task)
      task.task_state = 'test'
      task.save

      task.errors[:task_state].first.should == 'is not included in the list'
    end

    it "due date can't be in the past" do
      task = FactoryGirl.create(:task)
      task.due_date = 1.week.ago
      task.save

      task.errors[:due_date].first.should == 'should be future date'
    end
  end
end