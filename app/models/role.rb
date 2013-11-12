class Role < ActiveRecord::Base
  has_and_belongs_to_many :users

  REACHUI_USER = "reachui_user"
end
