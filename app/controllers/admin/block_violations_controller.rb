class Admin::BlockViolationsController < ApplicationController
  include Authenticator

  layout "admin"

  def index
    block_violations = BlockViolations.all.order("#{sort_column} #{sort_direction}")
    @block_violations = Kaminari.paginate_array(block_violations).page(params[:page]).per(50);
  end

end
