module Admin::AudienceGroupsHelper
  def full_name(segment)
    return "#{segment.friendly_name} (#{segment.name})" unless segment.friendly_name.nil?
    return "(#{segment.name})"
  end
end