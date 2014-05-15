class MediaTypesController < ApplicationController
  include Authenticator

  respond_to :html, :json

  def media_types
    @media_types = MediaType.of_network(current_network).select(:category, :id).distinct.order("category ASC")
    respond_with(@media_types)
  end

  def platforms
    @media_types = MediaType.of_network(current_network).includes(:platforms)
    respond_with(@media_types)
  end
end