module YajlTemplateHandler
  def self.erb_handler
    @@erb_handler ||= ActionView::Template.registered_template_handler(:erb)
  end
 
  def self.call(template)
    compiled_source = erb_handler.call(template)
    "Tilt::YajlTemplate.new{ #{compiled_source} }.render(self)"
  end
end