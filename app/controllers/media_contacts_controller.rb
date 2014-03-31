class MediaContactsController < ApplicationController
  include Authenticator

  respond_to :json

  def search
    @media_contacts = if params[:search_by] == 'email'
      MediaContact.where("email ilike ?", "#{params[:search]}%")
    elsif params[:search_by] == 'name'
      MediaContact.where("name ilike ?", "#{params[:search]}%")
    end

    render json: @media_contacts.select('id, name, email, phone').limit(8)
  end

  def for_reach_client
    render json: MediaContact.for_user(params[:client_id]).order(:name).all
  end
end
