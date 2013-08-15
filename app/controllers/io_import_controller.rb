class IoImportController < ApplicationController
  include Authenticator

  respond_to :json

  def create
    io_file = params[:io_file]
    @io_import = IoImport.new(io_file, current_user)
    @io_import.import

    @io_details = @io_import.order.io_detail
    @possible_advertisers = if @io_details.try(:client_advertiser_name).blank?
      []
    else
      Advertiser.collective_company.where(["network_advertisers.name LIKE ?", "#{@io_details.client_advertiser_name}%"]).map(&:name)
    end

    respond_with(@io_import)
  end
end
