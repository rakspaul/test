class CreativesImportController < ApplicationController
  include Authenticator

  respond_to :json

  def create
    creatives_file = params[:io_creatives]
    Rails.logger.warn 'creatives_file - ' + creatives_file.inspect

    creatives_parser = Parsers::CoxCreative.new(creatives_file)
    creatives_parser.parse

    # Fix for browsers which don't support application/json content type with iframe based uploads
    # https://github.com/blueimp/jQuery-File-Upload/wiki/Setup#content-type-negotiation
    content_type = request.headers['HTTP_ACCEPT'].include?('application/json') ? 'application/json' : 'text/html'

    respond_with({1 => 1}, :content_type => content_type)
  end
end
