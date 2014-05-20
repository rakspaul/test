class TaskType < ActiveRecord::Base

  belongs_to :owner, :foreign_key => 'default_assignee_id', :class_name => 'Team'

  validates :type, :presence => true
  validates :default_sla, :presence => true, :numericality => { :only_integer => true, :greater_than => 0 }
  validates :default_assignee_id, :presence => true
end
