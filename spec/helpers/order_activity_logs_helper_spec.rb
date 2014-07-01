require 'spec_helper'

describe OrderActivityLogsHelper do

  describe "task_actions_states_from_state" do

    before :each do
      @task = FactoryGirl.create(:task)
    end

    it "should return possible states from open" do
      task_actions_states_from_state(@task).should == {"Complete" => "complete"}
    end

    it "should return possible states from complete" do
      task_actions_states_from_state(@task, :complete).should == {"Close" => "close", "Reopen" => "open"}
    end

    it "should return possible states from close" do
      task_actions_states_from_state(@task, :close).should == {"Reopen" => "open"}
    end
  end

  describe "possible_task_actions_for_current_user" do
    it "should return possible states from open" do
      task = FactoryGirl.create(:task)
      self.expects(:current_user).never
      possible_task_actions_for_current_user(task).should == {"Complete" => "complete"}
    end

    it "should return possible states from complete" do
      user = FactoryGirl.create(:user)
      task = FactoryGirl.create(:task, :task_state => Task::TaskState::COMPLETE)
      self.expects(:current_user).once.returns(user)
      possible_task_actions_for_current_user(task).should == Hash.new
    end

    it "should return possible states from complete - task created by current user" do
      task = FactoryGirl.create(:task, :task_state => Task::TaskState::COMPLETE)
      self.expects(:current_user).once.returns(task.created_by)
      possible_task_actions_for_current_user(task).should == {"Close" => "close", "Reopen" => "open"}
    end

    it "should return possible states from close" do
      user = FactoryGirl.create(:user)
      task = FactoryGirl.create(:task, :task_state => Task::TaskState::CLOSE)
      self.expects(:current_user).once.returns(user)
      possible_task_actions_for_current_user(task).should == Hash.new
    end

    it "should return possible states from close - task created by current user" do
      task = FactoryGirl.create(:task, :task_state => Task::TaskState::CLOSE)
      self.expects(:current_user).once.returns(task.created_by)
      possible_task_actions_for_current_user(task).should == {"Reopen" => "open"}
    end
  end
end