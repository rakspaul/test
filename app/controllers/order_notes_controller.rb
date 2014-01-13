class OrderNotesController < ApplicationController
  include Authenticator

  respond_to :json

  def index
    if params[:order_id]
      @notes = OrderNote.for_order(params[:order_id]).order('created_at desc')
      respond_with(@notes)
    end
  end

  # POST orders/{order_id}/notes
  def create
    order = Order.find(params[:order_id])
    p = params.require(:note).permit(:note)
    @note = OrderNote.new(p)
    @note.order = order
    @note.user = current_user
    @note.save

    respond_with(@note, location: nil)
  end

end
