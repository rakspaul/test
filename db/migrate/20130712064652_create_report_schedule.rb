class CreateReportSchedule < ActiveRecord::Migration

  def self.up
    create_table :report_schedule do |t|
      t.integer    :user_id
      t.string     :title
      t.string     :email
      t.boolean    :recalculate_dates
      t.datetime   :report_from, :null => false
      t.datetime   :report_to, :null => false
      t.boolean    :date_calculation
      t.string     :last_ran
      t.string     :url
      t.integer    :frequency_flag
      t.string     :weekday
      t.integer    :quarter
      t.string     :status, :default => 'Scheduled'
      t.datetime   :start_on, :null => false
      t.datetime   :end_on

      t.timestamps
    end
  end

  def self.down
    drop_table :report_schedule
  end
end
