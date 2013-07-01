require 'json'
require 'load_dimensions_wrapper'

class Reports::DimensionsController < ApplicationController
  include Authenticator

  respond_to :json
  
  def index
    case false
    when params[:start_date].present?
      render :json => "Missing Start date", :status => 500
    when params[:end_date].present?
      render :json => "Missing End date", :status => 500
    when params[:group].present?
      render :json => "Missing group", :status => 500
    when params[:cols].present?
      render :json => "Missing columns", :status => 500
    else
      start_date = params[:start_date]
      end_date = params[:end_date]
      group = params[:group]
      cols = params[:cols]
      filter = params[:filter]
      per_page = params[:per_page]
      offset = params[:offset]
      sort_param = params[:sort_param]
      sort_direction = params[:sort_direction]

      wrapper = LoadDimensionsWrapper.new
      results = wrapper.load(current_network, current_user, group, cols, filter, per_page, offset, start_date, end_date, sort_param, sort_direction)

      if results
        respond_with(results)
      else
        render :status => :not_found, :nothing => true
      end    
    end  
  end
		
end