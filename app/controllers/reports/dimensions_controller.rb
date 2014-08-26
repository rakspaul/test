class Reports::DimensionsController < ApplicationController
  include Authenticator,I18nHelper, DomainHelper
  respond_to :json

  def index
    @dimensions = ReportDimensions.all

    # Don't show Data Provider to a marketer
    if identifier == convention_marketer
      for item in @dimensions
        if item.name == 'Data Provider'
          @dimensions.delete(item)
        end
      end
    end

    # relabel order and advertiser for marketer

    for dimension in @dimensions
      if dimension.name == 'Advertiser'
        dimension.name =  localised(identifier + '.advertiser')

      elsif dimension.name == 'Order'
        dimension.name = localised(identifier + '.campaign')
      end
    end

    respond_with(@dimensions)
  end
end
