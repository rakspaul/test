json.id @lineitem.id
json.name @lineitem.name
json.active @lineitem.active
json.start_date format_date(@lineitem.start_date)
json.end_date format_date(@lineitem.end_date)
json.volume @lineitem.volume
json.rate @lineitem.rate
json.value @lineitem.value
