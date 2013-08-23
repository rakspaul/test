class MediaContactsController < ApplicationController
  respond_to :json

  def search
    @media_contacts = if params[:search_by] == 'email'
      MediaContact.where("email ilike ?", "#{params[:search]}%").limit(8).map(&:email)
    elsif params[:search_by] == 'name'
      MediaContact.where("name ilike ?", "#{params[:search]}%").limit(8).map(&:name)
    end

    render json: @media_contacts
  end
end
