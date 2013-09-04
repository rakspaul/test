class SegmentsController < ApplicationController
  include Authenticator
  respond_to :json

  def search
    search_query = params[:search]

    if search_query.blank?
      @segments = Segment.of_network(current_network).limit(500).order("name  asc")
    else
      @segments = Segment.of_network(current_network).where("name like ?" , "%#{search_query}%").limit(500).order("name  asc")
    end

    respond_with(@segments)
  end

end