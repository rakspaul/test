require 'csv'
require 'json'
require 'load_dimensions_wrapper'

class Reports::DimensionsController < ApplicationController
  include Authenticator

  respond_to :json	
  
  def index
    from_date = params[:from_date].present? ? params[:from_date] : ""
    to_date = params[:to_date].present? ? params[:to_date] : ""
    dimensions = params[:dimensions].present? ? params[:dimensions] : ""
    expand_id = params[:expand_id].present? ? params[:expand_id] : ""

    wrapper = LoadDimensionsWrapper.new
    csv_results = wrapper.load(current_user.id, dimensions, from_date, to_date, current_network, expand_id)
    
    respond_with(csv_results)
  end
		
end
