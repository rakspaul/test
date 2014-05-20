class Team < ActiveRecord::Base

  has_many :team_users
  has_many :users , :through => :team_users
  # TODO: what the purpose of this line
  # has_many :tasks , as: :assignable

  validates :name, :presence => true, :uniqueness => true

end
