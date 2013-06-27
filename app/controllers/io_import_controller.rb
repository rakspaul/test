class IoImportController < ApplicationController
  include Authenticator

  def create
    io_file = params[:io_file]
    io_import = IoImport.new(io_file, current_user)
    if io_import.save
      @order = io_import.io_order
    else
      render json: { errors: io_import.errors }, status: :unprocessable_entity
    end
  end
end
