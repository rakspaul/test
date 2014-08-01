require 'spec_helper'

describe TaskType do
  describe "validations" do
    it "should validate the fields" do
      task_type = TaskType.new(:type => '', :default_sla => 1.week)
      task_type.save

      task_type.errors[:type].should == ["can't be blank"]
      task_type.errors[:default_assignee_id].should == ["can't be blank"]
    end
  end

  it "should be saved successfully" do
    task_type = FactoryGirl.create(:task_type)
    task_type.new_record?.should be_false
  end
end