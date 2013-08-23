class UsersController < ApplicationController
  respond_to :json

  def search
    @users = if params[:search_by] == 'email'
      User.where("email ilike ?", "#{params[:search]}%").limit(8)
    elsif params[:search_by] == 'name'
      relation = params[:sales].present? ? User.sales_people : User
      relation.where("concat(first_name,' ',last_name) ilike ?", "#{params[:search]}%").limit(8)
    end

    @users.map!{|u| {id: u.id, email: u.email, phone: u.phone_number, name: "#{u.first_name} #{u.last_name}"} }

    render :json => @users.to_json
  end
end
