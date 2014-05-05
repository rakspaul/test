class MediaTypesController < ApplicationController
  include Authenticator

  # layout "admin"
  respond_to :html, :json

  def media_types
    @media_types = MediaType.of_network(current_network).select(:category, :id).distinct

    respond_with(@media_types)
  end

end