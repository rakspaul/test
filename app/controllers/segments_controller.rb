class SegmentsController < ApplicationController
  include Authenticator
  respond_to :json

  def search
    search_query = params[:search]
    networks = Rails.application.config.search_segments_in_network.split(',')

    if search_query.blank?
      @segments = Segment.of_networks(networks).limit(500).order("name  asc")
    else
      @segments = Segment.of_networks(networks).where("name like ? or friendly_name like ?", "%#{search_query}%", "%#{search_query}%").limit(500).order("name  asc")
    end

    respond_with(@segments)
  end

end