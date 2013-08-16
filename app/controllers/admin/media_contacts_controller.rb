class Admin::MediaContactsController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    @media_contacts = MediaContacts.all
    respond_with(@media_contacts)
  end

end
