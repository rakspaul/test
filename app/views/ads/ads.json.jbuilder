json.array! @ads.each do |ad|
  json.id ad.id
  json.name ad.description
end