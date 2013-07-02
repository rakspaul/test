ReachUI.Error = Backbone.Model.extend({
  defaults: {
    message: ''
  }
});

ReachUI.InlineErrorView = Backbone.Marionette.ItemView.extend({
  template: JST['templates/common/inline_error']
});

ReachUI.GlobalErrorView = Backbone.Marionette.ItemView.extend({
  template: JST['templates/common/global_error'],
  className: 'top-floating-error',

  events: {
    'click .close': 'hide'
  },

  initialize: function() {
    this.listenTo(this.model, 'change:message', this.render);
  },

  onRender: function() {
    var width = $(window).width(),
      elWidth = this.$el.width(),
      leftMargin = (width-elWidth)/2;
    this.$el.css("marginLeft", leftMargin);
    this.$el.show();
  },

  hide: function() {
    this.model.set({message: ''}, {silent:true});
    this.$el.hide();
  }
});

ReachUI.SetupGlobalErrorHandler = function() {
  var error = new ReachUI.Error(),
    errorView = new ReachUI.GlobalErrorView({model: error});

  var ERROR_MESSAGES = {
      0 : "Unable to connect to server.",
    500 : "Internal server error."
  };

  $(document.body).append(errorView.el);

  $(document).ajaxError(function(event, jqxhr, settings, exception) {
    if(ERROR_MESSAGES[jqxhr.status]) {
      error.set({message: ERROR_MESSAGES[jqxhr.status]});
    }
  });

  $(document).ajaxStart(function() {
    errorView.hide();
  });
}
