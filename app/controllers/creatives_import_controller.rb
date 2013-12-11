class CreativesImportController < ApplicationController
  include Authenticator

  respond_to :json

  def create
    creatives_file = params[:io_creatives]
    order_id       = params[:order_id]

    creatives_parser = Parsers::CoxCreative.new(creatives_file, order_id)
    @creatives, @errors = creatives_parser.parse
  end
end
