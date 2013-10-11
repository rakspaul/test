class SegmentsController < ApplicationController
  include Authenticator

  respond_to :json

  def search
    search_query = params[:search]
    networks = Rails.application.config.search_segments_in_network.split(',')

    @segments = Segment.of_networks(networks).where(:inactive => false).limit(500).order("name  asc")
    unless search_query.blank?
      @segments = @segments.where("lower(name) ilike lower(?) or lower(friendly_name) ilike lower(?)", "%#{search_query}%", "%#{search_query}%")
    end

    respond_with(@segments)
  end

end
