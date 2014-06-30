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
end