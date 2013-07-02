class IoExportController < ApplicationController
  include Authenticator

  def export
  	order_id =params[:order_id]
  	io_export = IoExport.new(order_id, current_user)
	if io_export.export_order
      send_file io_export.get_file_path , :x_sendfile => true
    else
      render json: { errors: io_export.errors }, status: :unprocessable_entity
    end
  end
end