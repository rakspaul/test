json.id             creative.try(:id)
json.ad_size        creative[:ad_size] || creative.size
json.redirect_url   creative[:image_url] || creative.redirect_url

json.client_ad_id   creative[:ad_id] || creative.client_ad_id

json.source_id      creative.try(:source_id)

json.html_code_excerpt html_code_excerpt(creative)

json.html_code      h(creative.try(:html_code))
json.creative_type  creative[:creative_type] || creative.try(:creative_type)
json.io_lineitem_id creative.try(:lineitem_assignment).try(:io_lineitem_id)
json.ad_id          creative.try(:ad_assignment).try(:ad_id)
json.li_assignment_id creative.try(:lineitem_assignment).try(:id)
json.ad_assignment_id creative.try(:ad_assignments).try(:first).try(:id)
