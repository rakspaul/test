class ContextsController < ApplicationController
  include Authenticator

  respond_to :json

  def search
    search_query = params[:search]
    networks = Rails.application.config.search_contexts_in_network.split(',')

    @contexts = Context.of_networks(networks).where(:inactive => false).limit(500).order("name  asc")
    unless search_query.blank?
      @contexts = @contexts.where("lower(name) ilike lower(?) or lower(friendly_name) ilike lower(?)", "%#{search_query}%", "%#{search_query}%")
    end

    respond_with(@contexts)
  end

end
