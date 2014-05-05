class Admin::MediaTypes < ApplicationController
  include Authenticator

  # layout "admin"
  respond_to :html, :json

end