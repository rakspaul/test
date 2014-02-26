class Role < ActiveRecord::Base
  REACHUI_USER = "reachui_user"
  REACH_UI = "reach_ui"

  has_and_belongs_to_many :users
end
