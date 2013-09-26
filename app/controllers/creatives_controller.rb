class CreativesController < ApplicationController
  respond_to :json

  def destroy
    li = Lineitem.find(params[:lineitem_id])
    creative = li.creatives.find(params[:id])
    #creative.destroy
    respond_with(creative)
  end
end
