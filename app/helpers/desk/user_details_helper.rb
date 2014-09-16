module Desk::UserDetailsHelper

  def auth_token
    Digest::MD5.hexdigest("#{current_user.network.id}:#{current_user.id}:#{Date.today.strftime('%Y-%m-%d')}")
  end
end