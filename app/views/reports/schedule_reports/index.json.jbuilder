json.array! @reports do |report|
  json.id report.id
  json.title report.title
  json.email report.email
  json.recalculate_dates report.recalculate_dates
  json.start_date report.start_date
  json.end_date report.end_date
  json.url report.url
  json.last_ran report.last_ran
  json.frequency_type report.frequency_type
  json.frequency_value report.frequency_value
  json.report_start_date format_date(report.report_start_date)
  json.report_end_date format_date(report.report_end_date)
  json.status report.status
  json.created_at format_date(report.created_at)
  json.updated_at format_date(report.updated_at)
end