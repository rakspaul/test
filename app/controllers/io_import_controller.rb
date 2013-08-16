class IoImportController < ApplicationController
  include Authenticator

  respond_to :json

  def create
    io_file = params[:io_file]
    @io_import = IoImport.new(io_file, current_user)
    @io_import.import

    @io_details = @io_import.order.io_detail

    respond_with(@io_import)
  end
end
