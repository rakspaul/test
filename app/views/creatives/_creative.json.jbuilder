json.id creative.try(:id)
json.ad_size creative[:ad_size]
json.start_date format_date(creative[:start_date])
json.end_date format_date(creative[:end_date])
json.image_url creative[:image_url]
json.ad_id creative[:ad_id]
