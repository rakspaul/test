json.id             creative.try(:id)
json.ad_size        creative[:ad_size] || creative.size
json.start_date     format_date(creative[:start_date] || creative.lineitem_assignment.try(:start_date))
json.end_date       format_date(creative[:end_date] || creative.lineitem_assignment.try(:end_date))
json.redirect_url   creative[:image_url] || creative.redirect_url
json.client_ad_id   creative[:ad_id] || creative.redirect_url.try(:match, /adid=(\d+);/).try(:[], 1)
json.source_id      creative.try(:source_id)
json.creative_type  creative.try(:creative_type)
json.io_lineitem_id creative.try(:lineitem_assignment).try(:io_lineitem_id)
json.ad_id          creative.try(:ad_assignment).try(:ad_id)
