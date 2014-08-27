class AccountSessionsController < ApplicationController
  include Authenticator
  include DomainHelper
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
    user = @account_session.account.try(:user)
    respond_with(@account_session) do |format|
      format.html do
        if @account_session.errors.empty?
          if (domain_reach? && (network_reach_user_login?(user) || agency_reach_user_login?(user))) \
            || (domain_desk? && (network_cdesk_user_login?(user) || agency_cdesk_user_login?(user)))
            redirect_back_or_default orders_path
          elsif (domain_reach? && (network_cdesk_user_login?(user) || agency_cdesk_user_login?(user))) \
            ||  (domain_desk? && (network_reach_user_login?(user) || agency_reach_user_login?(user)))
            @account_session.destroy
            @account_session.errors.add(:base, "Access not enabled")
            render :action => 'new'
          elsif !domain_desk? && !domain_reach? && (network_reach_user_login?(user) || agency_reach_user_login?(user) \
            || network_cdesk_user_login?(user) || agency_cdesk_user_login?(user))
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

    def network_reach_user_login?(user)
      user.network_user? && user.has_roles?([Role::REACH_UI])
    end

    def agency_reach_user_login?(user)
      user.agency_user? && user.has_roles?([Role::REACH_UI]) && user.agency.try(:reach_clients).try(:length) > 0
    end

    def network_cdesk_user_login?(user)
      user.network_user? && user.has_roles?([Role::CDESK])
    end

    def agency_cdesk_user_login?(user)
      user.agency_user? && user.has_roles?([Role::CDESK])
    end

end

