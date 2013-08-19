class Admin::MediaContactsController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @media_contacts = MediaContacts.for_user(params[:id])
    respond_with(@media_contacts)
  end

  def create
    p = params.require(:mediaContact).permit(:name, :phone, :email, :reach_client_id)
    @mediaContact = MediaContacts.new(p)
    @mediaContact.name = params[:mediaContact][:name]
    @mediaContact.phone = params[:mediaContact][:phone]
    @mediaContact.email = params[:mediaContact][:email]
    @mediaContact.reach_client_id = params[:mediaContact][:reach_client_id]
    @mediaContact.save

    respond_with(@mediaContact, location: nil)
  end


end
