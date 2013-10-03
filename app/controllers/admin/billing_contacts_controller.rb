class Admin::BillingContactsController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @billing_contacts = BillingContact.for_user(params[:id])
    respond_with(@billing_contacts)
  end

  def create
    @billing_contact = BillingContact.new(billing_contact_params)
    @billing_contact.save

    respond_with(@billing_contact, location: nil)
  end

  def update
    @billing_contact = BillingContact.find(params[:id])
    @billing_contact.update_attributes(billing_contact_params)
    @billing_contact.save

    respond_with(@billing_contact)
  end

  def billing_contact_params
    params.require(:billingContact).permit(:name, :phone, :email, :address, :reach_client_id)
  end

end