json.array! @activities do |activity|
  json.partial! 'activity', activity: activity
end
