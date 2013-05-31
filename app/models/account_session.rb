class AccountSession < Authlogic::Session::Base
  generalize_credentials_error_messages "Invalid username/password"
end
