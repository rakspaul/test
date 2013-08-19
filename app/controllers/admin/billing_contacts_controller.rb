class Admin::BillingContactsController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @billing_contacts = BillingContacts.for_user(params[:id])
    respond_with(@billing_contacts)
  end

  def create
    p = params.require(:billingContact).permit(:name, :phone, :email, :reach_client_id)
    @billingContact = BillingContacts.new(p)
    @billingContact.name = params[:billingContact][:name]
    @billingContact.phone = params[:billingContact][:phone]
    @billingContact.email = params[:billingContact][:email]
    @billingContact.reach_client_id = params[:billingContact][:reach_client_id]
    @billingContact.save

    respond_with(@billingContact, location: nil)
  end

end