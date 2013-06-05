class BuyController < ApplicationController
  include Authenticator

  add_crumb("Orders") {|instance| instance.send :buy_index_path}

  def index
  end
end
