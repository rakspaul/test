class Reports::DimensionsController < ApplicationController
  include Authenticator,I18nHelper, DomainHelper
  respond_to :json

  def index
    @dimensions = ReportDimensions.all

   # Don't show Data Provider to a marketer
    if identifier == convention_marketer
      @dimensions.reject! {|dimension| dimension.name == 'Data Provider'}
    end

    # relabel order and advertiser for marketer
    @dimensions.each do |dimension|
      if dimension.name == 'Advertiser'
        dimension.name =  localised(identifier + '.advertiser')

      elsif dimension.name == 'Order'
        dimension.name = localised(identifier + '.campaign')
      end
    end

    respond_with(@dimensions)
  end
end
