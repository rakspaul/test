module Authenticator
  extend ActiveSupport::Concern

  included do
    if self.to_s != 'AccountSessionsController'
      before_action :require_user
    end

    helper_method :current_user, :current_network
  end

  def current_account_session
    return @current_account_session if defined?(@current_account_session)
    @current_account_session = AccountSession.find
  end

  def current_account
    return @current_account if defined?(@current_account)
    @current_account = current_account_session && current_account_session.account
  end

  def current_user
    return @current_user if defined?(@current_user)
    @current_user = current_account && current_account.user
  end

  def current_network
    return @current_network if defined?(@current_network)
    @current_network = current_user && current_user.network
  end

  def require_user
    unless current_user
      store_location
      redirect_to root_path
      return false
    end
  end

  def store_location
    session[:return_to] = request.fullpath
  end

  def redirect_back_or_default(default)
    redirect_to(session[:return_to] || default)
    session[:return_to] = nil
  end
end
