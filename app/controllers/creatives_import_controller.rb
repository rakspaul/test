class CreativesImportController < ApplicationController
  include Authenticator

  respond_to :json

  def create
    creatives_file = params[:io_creatives]

    creatives_parser = Parsers::CoxCreative.new(creatives_file)
    @creatives, @errors = creatives_parser.parse
  end
end
