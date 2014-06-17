class KeyValuesController < ApplicationController
  include Authenticator, KeyValuesHelper

  respond_to :json

  def validate
    key_value_expr = params[:kv_expr]
    response = validate_key_values(key_value_expr)

    render json: {message: response.body}, status: response.code
  end

end
