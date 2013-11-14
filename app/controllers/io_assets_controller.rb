class IoAssetsController < ApplicationController
  include Authenticator

  def serve
    order =Order.find params[:order_id]
    io_asset = IoAsset.find_by order_id: params[:order_id]
    if io_asset
      send_file io_asset.asset_path, :type => "application/vnd.ms-excel",
        :filename => io_asset.asset_upload_name, :stream => false if io_asset
    else
      render :not_found
    end
  end

end
