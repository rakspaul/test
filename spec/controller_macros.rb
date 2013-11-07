module ControllerMacros
  def json_parse(json_str)
    JSON.parse(json_str).with_indifferent_access
  end
end
