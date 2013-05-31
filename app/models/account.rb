class Account < ActiveRecord::Base
  acts_as_authentic do |c|
    c.act_like_restful_authentication = true
  end

  belongs_to :user
end

