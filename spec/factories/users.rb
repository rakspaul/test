require 'faker'

FactoryGirl.define do
  factory :user do |f|
    f.account_login { Faker::Internet.user_name }
    f.email { Faker::Internet.email }
    f.client_type "Network"
    network { FactoryGirl.singleton :network }
  end

  factory :default_user, :parent => :user do |f|
    id 1
    first_name "Sean"
    last_name  "Durnan"
  end
end


