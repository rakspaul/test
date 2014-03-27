class CreativesController < ApplicationController
  include Authenticator

  respond_to :json

  def destroy
    li = Lineitem.find(params[:lineitem_id])
    creative = li.creatives.find_by(id: params[:id])
    respond_with(creative)
  end
end
