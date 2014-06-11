class Team < ActiveRecord::Base

  has_many :team_users
  has_many :users , :through => :team_users
  has_many :tasks , :as => :assignable
  has_many :team_task_types, :foreign_key => "team_id", :dependent => :destroy
  has_many :task_types, :through => :team_task_types

  validates :name, :presence => true, :uniqueness => true
  validates_associated :team_task_types
end

