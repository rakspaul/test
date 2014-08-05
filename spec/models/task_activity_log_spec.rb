require 'spec_helper'

describe TaskActivityLog do
  describe 'validations' do
    it 'should check all validations' do
      tal = FactoryGirl.create :task_activity_log
      tal.new_record?.should be_false
    end
  end

  describe 'activity_type' do
    it 'should be from the task activity type constants' do
      tal = FactoryGirl.create :task_activity_log, :activity_type => TaskActivityLog::ActivityType::USER_COMMENT
      tal.new_record?.should be_false

      expect {
        tal = FactoryGirl.create :task_activity_log, :activity_type => 'Dummy'
      }.to raise_exception ActiveRecord::RecordInvalid


    end
  end

end