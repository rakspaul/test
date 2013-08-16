class Admin::BillingContactsController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @billing_contacts = BillingContacts.all
    respond_with(@billing_contacts)
  end

end
