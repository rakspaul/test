ReachUI.namespace("Reports");

ReachUI.Reports.List = function() {
  var text = "Default text";
  var el = null;

  var privateRender = function() {
    $(el).html(text);
  }

  return {
    init: function(_el, _text) {
      el = _el;
      text = _text;
    },

    renderText: function() {
      privateRender();
    }
  }
}

