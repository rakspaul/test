class Desk::OrdersController < ApplicationController

  layout "cdesk"

  respond_to :html

  def index
    respond_to do | format |
      format.html
    end
  end
end
