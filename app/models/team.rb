class Team < ActiveRecord::Base
  has_many :users , through: :teams_users
  has_many :tasks , as: :assignable
end
