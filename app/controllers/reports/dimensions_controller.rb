class Reports::DimensionsController < ApplicationController
  include Authenticator

  respond_to :json	
  
  def index
  	csv_results = []
  	wrapper = LoadDimensionsWrapper.new
  	csv_results = wrapper.load(current_user.id)
 
  	respond_with(csv_results)
  end
		
end
