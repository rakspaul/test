class AccountSessionsController < ApplicationController
  include Authenticator

  layout "login"

  before_action :require_no_user, :only => [:new, :create]
  before_action :require_user, :only => [:destroy]
  respond_to :xml, :html

  # login page
  def new
    respond_to do |format|
      format.html do
        @account_session = AccountSession.new
      end
      format.xml
    end
  end

  # login
  def create
    @account_session = AccountSession.new(:login => params[:login],:password => params[:password])
    flash.now[:notice] = "Login successful." if @account_session.save

    respond_with(@account_session) do |format|
      format.html do
        if @account_session.errors.empty? then
          if is_network_login(@account_session.account.user) || is_agency_login(@account_session.account.user)
            redirect_back_or_default orders_path
          else
            @account_session.destroy
            @account_session.errors.add(:base, "Invalid username/password" )
            render :action => 'new'
          end
        else
          render :action => 'new'
        end
      end
    end
  end

  # logout
  def destroy
    current_account_session.destroy
    redirect_to root_path
  end

  private

    def require_no_user
      if current_user
        respond_to do |format|
          format.html do
            store_location
            redirect_to orders_path
          end
          format.xml{}
        end
      end
    end

    def is_network_login(user)
      return (user.is_client_type(User::CLIENT_TYPE_NETWORK) && user.has_roles?([Role::REACH_UI]))
    end

    def is_agency_login(user)
      return (user.is_client_type(User::CLIENT_TYPE_AGENCY) && user.has_roles?([Role::REACH_UI])) && user.try(:agency).try(:reach_clients).length > 0
    end
end

