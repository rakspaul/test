json.imported_creatives do
  json.array! @creatives do |inred|
    json.partial! 'creatives/creative.json.jbuilder', creative: inred
  end
end

json.errors do
  json.array! @errors do |error|
    json.error error
  end
end
