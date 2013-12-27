module ControllerMacros
  def json_parse(json_str)
    json = JSON.parse(json_str)
    if json.kind_of?(Array)
      json.map { |a| a.with_indifferent_access }
    else
      json.with_indifferent_access
    end
  end
end
