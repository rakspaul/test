(function(Search) {
  'use strict';

  Search.SearchQuery = Backbone.Model.extend({
    defaults: {
      'query': ''
    }
  });

  Search.SearchQueryView = Backbone.Marionette.View.extend({
    el: '.form-search',

    events: {
      'click #search_button': 'onSearchClick',
      'keypress .search-query': 'onKeyPress'
    },

    initialize: function() {
      _.bindAll(this, '_focusSearchInput');
    },

    onSearchClick: function() {
      this._setSearchText();
    },

    onKeyPress: function(evt) {
      var ENTER_KEY = 13;

      if(evt.which === ENTER_KEY) {
        this._setSearchText();
      }
    },

    bindShortcutKey: function(key) {
      Mousetrap.bind([key], this._focusSearchInput);
    },

    _focusSearchInput: function(e) {
      this.$('.search-query').focus();
      return false;
    },

    _setSearchText: function() {
      var val = this.$el.find('.search-query').val();
      this.model.set({'query': val});
    }
  });

})(ReachUI.namespace("Search"));
