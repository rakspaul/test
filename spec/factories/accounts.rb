require 'faker'

FactoryGirl.define do
  factory :account do |f|
    user
    f.login { Faker::Internet.user_name(4..40) }
    f.password "ampui"
    f.password_confirmation "ampui"
  end
end

