class Admin::MediaContactsController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @media_contacts = MediaContact.for_user(params[:id])
    respond_with(@media_contacts)
  end

  def create
    @media_contact = MediaContact.new(media_contact_params)
    @media_contact.save

    respond_with(@media_contact, location: nil)
  end

  def update
    @media_contact = MediaContact.find(params[:id])
    @media_contact.update_attributes(media_contact_params)
    @media_contact.save

    respond_with(@media_contact)
  end

  def media_contact_params
    params.require(:mediaContact).permit(:name, :phone, :email, :address, :reach_client_id)
  end

end