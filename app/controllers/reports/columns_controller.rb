class Reports::ColumnsController < ApplicationController
  include Authenticator,I18nHelper, DomainHelper
  respond_to :json

  def index
    @columns = ReportColumns.all

    @columns.each do |column|
      column.name = localised("#{identifier}.report.#{column.internal_name}")
    end

    respond_with(@columns)
  end
end