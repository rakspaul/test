class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  add_crumb "Home", '/'

  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found_error

  protected
    def record_not_found_error
      respond_to do |format|
        format.html { render :not_found }
        format.json { render json: "Record not found", status: :unprocessable_entity }
      end
    end
end
