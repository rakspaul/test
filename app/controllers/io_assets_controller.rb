class IoAssetsController < ApplicationController
  include Authenticator

  respond_to :xls

  def serve
    order = Order.of_network(current_network).includes(:advertiser).find(params[:order_id])

    if params[:io_asset_id]
      io_asset = order.io_assets.find_by_id params[:io_asset_id]
    else
      io_asset = order.io_assets.details.first
    end

    if io_asset
      respond_with do |format|
        format.xls { send_file io_asset.asset_path, type: Mime::Type.lookup_by_extension(:xls),
                     filename: io_asset.asset_upload_name, stream: false }
        format.pdf { send_file io_asset.asset_path, type: Mime::PDF,
                     filename: io_asset.asset_upload_name, stream: false }
        format.text { send_file io_asset.asset_path, type: Mime::TEXT,
                     filename: io_asset.asset_upload_name, stream: false }
      end
    else
      respond_with do |format|      
        render json: { errors: :not_found }, status: :unprocessable_entity
      end
    end
  end

end
