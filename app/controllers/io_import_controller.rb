class IoImportController < ApplicationController
  include Authenticator

  respond_to :json

  def create
    io_file = params[:io_file]
    @io_import = IoImport.new(io_file, current_user, params[:current_order_id])
    @io_import.import

    @io_details = @io_import.io_details
    @lineitems  = @io_import.lineitems
    @notes      = @io_import.notes

    # Fix for browsers which don't support application/json content type with iframe based uploads
    # https://github.com/blueimp/jQuery-File-Upload/wiki/Setup#content-type-negotiation
    content_type = request.headers['HTTP_ACCEPT'].include?('application/json') ? 'application/json' : 'text/html'

    respond_with(@io_import, :content_type => content_type)
  end
end
