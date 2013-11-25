class Role < ActiveRecord::Base
  REACHUI_USER = "reachui_user"

  has_and_belongs_to_many :users
end
