class IoImportController < ApplicationController
  include Authenticator

  respond_to :json

  def create
    io_file = params[:io_file]
    @io_import = IoImport.new(io_file, current_user)
    @io_import.import

    @io_details = @io_import.order.io_detail
    @possible_advertisers = @io_details.try(:client_advertiser_name).blank? ? [] : Advertiser.includes(:network).where(['name LIKE ?', "#{@io_details.client_advertiser_name}%"]).map{|a| [a.name, a.network.name]}

    respond_with(@io_import)
  end
end
