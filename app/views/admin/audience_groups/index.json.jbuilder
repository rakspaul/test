json.array! @audience_groups do |group|
  json.id           group.id
  json.name         group.name
  json.key_values   group.key_values
end
