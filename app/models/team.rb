class Team < ActiveRecord::Base

  has_many :team_users
  has_many :task_types, :foreign_key => 'default_assignee_id'
  has_many :users , :through => :team_users
  has_many :tasks , :as => :assignable

  validates :name, :presence => true, :uniqueness => true

end
