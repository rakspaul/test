require './lib/yajl_template_handler'

ActionView::Template.register_template_handler('yajl', YajlTemplateHandler )
