class BillingContactsController < ApplicationController
  respond_to :json

  def search
    @billing_contacts = if params[:search_by] == 'email'
      BillingContact.where("email ilike ?", "#{params[:search]}%")
    elsif params[:search_by] == 'name'
      BillingContact.where("name ilike ?", "#{params[:search]}%")
    end

    render json: @billing_contacts.select('id, name, email, phone').limit(8)
  end

  def for_reach_client
    render json: BillingContact.for_user(params[:client_id]).order(:name).all
  end
end
