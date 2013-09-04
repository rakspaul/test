module Admin::AudienceGroupsHelper
  def full_name(segment)
    return "#{segment.name} : #{segment.friendly_name}" unless segment.friendly_name.nil?
    return segment.name
  end
end