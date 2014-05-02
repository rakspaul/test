class ContextsController < ApplicationController
  include Authenticator

  respond_to :json

  def search
    search_query = params[:search]
    network = Rails.application.config.search_contexts_in_network

    @contexts = Context
      .with_counts
      .of_networks(network)
      .where(:inactive => false)
      .where.not(:type => ['Pixel', 'InvalidContext'])
      .limit(500).order("name  asc")

    unless search_query.blank?
      @contexts = @contexts.where("lower(contexts.name) ilike lower(?)
        or lower(contexts.friendly_name) ilike lower(?)", "%#{search_query}%", "%#{search_query}%")
    end

    respond_with(@contexts)
  end

end
