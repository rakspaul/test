class TaskType < ActiveRecord::Base

  self.inheritance_column = 'task_type'

  belongs_to :owner, :foreign_key => 'default_assignee_id', :class_name => 'Team'
  has_many :team_task_types, :foreign_key => "task_type_id", :dependent => :destroy
  has_many :default_team, :through => :team_task_types, :source => :team

  validates :type, :presence => true
  validates :default_sla, :presence => true, :numericality => { :only_integer => true, :greater_than => 0 }
  validates :default_assignee_id, :presence => true
  validates_associated :team_task_types
end
