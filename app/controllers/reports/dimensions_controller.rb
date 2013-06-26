require 'json'
require 'load_dimensions_wrapper'

class Reports::DimensionsController < ApplicationController
  include Authenticator

  respond_to :json	
  
  def index
    start_date = params[:start_date].present? ? params[:start_date] : ""
    end_date = params[:end_date].present? ? params[:end_date] : ""
    group = params[:group].present? ? params[:group] : ""
    cols = params[:cols].present? ? params[:cols] : ""
    filter = params[:filter].present? ? params[:filter] : ""

    wrapper = LoadDimensionsWrapper.new
    results = wrapper.load(group, cols, filter, start_date, end_date, current_network, current_user)
    
    respond_with(results)
  end
		
end
