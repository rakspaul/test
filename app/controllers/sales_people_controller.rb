class SalesPeopleController < ApplicationController
  include Authenticator

  def index
    @sales_people = SalesPeople.of_network(current_network).where("name ilike ?", "%#{params[:search]}%")
  end
end
