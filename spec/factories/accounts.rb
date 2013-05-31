require 'faker'

FactoryGirl.define do
  factory :account do |f|
    user
    f.login { Faker::Internet.user_name }
    f.password "ampui"
    f.password_confirmation "ampui"
  end
end

