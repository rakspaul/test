require 'faker'

FactoryGirl.define do
  factory :user do |f|
    f.account_login { Faker::Internet.user_name }
    f.email { Faker::Internet.email }
    f.company_id 81
    f.client_type "Network"
    network
  end
end


