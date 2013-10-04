json.array! @contexts do |context|
  json.partial! 'context', context: context
end