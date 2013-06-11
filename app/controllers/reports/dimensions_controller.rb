class Reports::DimensionsController < ApplicationController
  include Authenticator

  respond_to :json	
  
  def index
  	existing = params[:existing].present? ? params[:existing] : ""
  	selected = params[:selected].present? ? params[:selected] : ""

  	if existing == ""
  	  if selected == "orders"
  	    @orders = Order.of_network(current_network).limit(50)
  	    respond_with(@orders)
  	  end
  	  
  	  if selected == "advertisers"
  	    @advertisers = Advertiser.of_network(current_network).limit(50)
  	    respond_with(@advertisers)
  	  end
  	
  	else
  	  if existing == "orders" && selected == "advertisers"
  	  	 # return result based on advertiser
  	    @orders = Order.load_with_advertiser(current_network).limit(50)
  	    respond_with(@orders)
  	  else
  	  	 # return result based on orders
  	  	@advertisers = Advertiser.load_with_orders(current_network).limit(50)
  	    respond_with(@advertisers)
  	  end	 
    end

  end
		
end
