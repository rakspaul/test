ReachUI.namespace("Buying");

ReachUI.Buying.SearchOrders = (function() {
  'use strict';

  var Order = Backbone.Model.extend({});

  var OrderList = Backbone.Collection.extend({
    model: Order,
    url: '/orders/orders/search.json'
  });

  var SearchQuery = Backbone.Model.extend({
    defaults: {
      'query': ''
    }
  });

  var SearchQueryView = Backbone.Marionette.View.extend({
    el: '.form-search',

    events: {
      'click #search_button': 'onSearchClick',
      'keypress .search-query': 'onKeyPress'
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

    _setSearchText: function() {
      var val = this.$el.find('.search-query').val();
      this.model.set({'query': val});
    }
  });

  var SearchOrderItemView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/buying/order_search_item'],
    className: 'order',
    triggers: {
      'click': 'selected'
    }
  });

  var SearchOrderEmptyView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/buying/order_search_empty'],
    className: 'no-order-found'
  });

  var SearchOrderCollectionView = Backbone.Marionette.CollectionView.extend({
    itemView: SearchOrderItemView,
    emptyView: SearchOrderEmptyView,

    onBeforeItemAdded: function(itemView) {
      // This will make sure emptyView don't get style change
      if(itemView.model.id) {
        var cls = itemView.model.get('active') ? 'active-order' : 'inactive-order';
        itemView.$el.addClass(cls);
      }
    }
  });

  var init = function() {
    var orderList = new OrderList(),
      searchCollectionView = new SearchOrderCollectionView({el: '.order-search-result', collection: orderList}),
      search = new SearchQuery(),
      searchView = new SearchQueryView({model: search});

    searchView.render();
    search.on('change:query', function() {
      orderList.fetch({data: {search: this.get('query')}});
    });

    orderList.fetch();

    var selectedOrder = null;
    searchCollectionView.on("itemview:selected", function(view) {
      if(selectedOrder) {
        var selectedView = searchCollectionView.children.findByModel(selectedOrder);
        selectedView.$el.removeClass("order-selected");
      }
      selectedOrder = view.model;
      view.$el.addClass("order-selected");
    });
  }

  return  {
    initialize: init
  };
}());
