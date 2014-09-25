module Desk::AngularViewsHelper

  def render_view_js_template(template, locals={})
    content_tag(:script, render(template, locals).html_safe, :id => template, :type => 'text/ng-template').html_safe
  end

end