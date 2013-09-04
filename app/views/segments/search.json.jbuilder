json.array! @segments do |segment|
  json.partial! 'segment', segment: segment
end