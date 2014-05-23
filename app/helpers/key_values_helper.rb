module KeyValuesHelper

  def validate_key_values(key_value_expr)
    if key_value_expr && key_value_expr != ""
      backbone_service_url = Rails.application.config.backbone_service_url
      uri = URI.parse( "#{backbone_service_url}kvexpression/validate")
      response = Net::HTTP.post_form(uri, {"expr" => key_value_expr})
      response
    end
  end

end
