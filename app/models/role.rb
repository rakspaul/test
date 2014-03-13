class Role < ActiveRecord::Base
  REACH_UI = "reach_ui"

  has_and_belongs_to_many :users
end
