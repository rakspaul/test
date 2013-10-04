class Admin::MediaContactsController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @media_contacts = MediaContact.for_user(params[:id])
    respond_with(@media_contacts)
  end

  def create
    p = params.require(:mediaContact).permit(:name, :phone, :email, :address, :reach_client_id)
    @media_contact = MediaContact.new(p)
    @media_contact.save

    respond_with(@media_contact, location: nil)
  end

end