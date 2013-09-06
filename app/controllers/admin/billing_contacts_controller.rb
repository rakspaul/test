class Admin::BillingContactsController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @billing_contacts = BillingContact.for_user(params[:id])
    respond_with(@billing_contacts)
  end

  def create
    p = params.require(:billingContact).permit(:name, :phone, :email, :address, :reach_client_id)
    @billing_contact = BillingContact.new(p)
    @billing_contact.save

    respond_with(@billing_contact, location: nil)
  end

end