class BillingContactsController < ApplicationController
  respond_to :json

  def search
    @billing_contacts = if params[:search_by] == 'email'
      BillingContact.where("email ilike ?", "#{params[:search]}%").limit(8).map(&:email)
    elsif params[:search_by] == 'name'
      BillingContact.where("name ilike ?", "#{params[:search]}%").limit(8).map(&:name)
    end

    render json: @billing_contacts
  end
end
