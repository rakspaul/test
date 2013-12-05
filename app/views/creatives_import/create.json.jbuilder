json.array! @creatives do |inred|
  json.partial! 'creatives/creative.json.jbuilder', creative: inred
end

json.array! @errors do |error|
  json.error error
end
