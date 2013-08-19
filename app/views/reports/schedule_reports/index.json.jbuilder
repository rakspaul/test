json.array! @reports do |report|
  json.partial! 'report', report: report
end