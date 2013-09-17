json.id creative.try(:id)
json.ad_size creative[:ad_size] || creative.size
json.start_date format_date(creative[:start_date] || creative.lineitem_assignment.try(:start_date))
json.end_date format_date(creative[:end_date] || creative.lineitem_assignment.try(:end_date))
json.image_url creative[:image_url] || creative.name
json.ad_id creative[:ad_id] || creative.source_ui_creative_id
