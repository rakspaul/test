class CreativesImportController < ApplicationController
  include Authenticator

  respond_to :json

  def create
    creatives_file = params[:io_creatives]

    creatives_parser = Parsers::CoxCreative.new(creatives_file)
    @creatives, errors = creatives_parser.parse

    # Fix for browsers which don't support application/json content type with iframe based uploads
    # https://github.com/blueimp/jQuery-File-Upload/wiki/Setup#content-type-negotiation
    content_type = request.headers['HTTP_ACCEPT'].include?('application/json') ? 'application/json' : 'text/html'

    respond_with((errors.empty? ? @creatives : errors), content_type: content_type)
  end
end
