ReachUI.namespace("Buying");

ReachUI.Buying.SearchOrders = (function() {
  var Order = Backbone.Model.extend({});

  var OrderList = Backbone.Collection.extend({
    model: Order,
    url: '/buying/orders/search.json'
  });

  var Search = Backbone.Model.extend({
    defaults: {
      'term': ''
    }
  });

  var SearchView = Backbone.Marionette.View.extend({
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
      this.model.set({'term': val});
    }
  });

  var SearchOrderItemView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/buying/order_search_item'],
    className: 'order'
  });

  var SearchOrderEmptyView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/buying/order_search_empty'],
    className: 'no-order-found'
  });

  var SearchOrderCollectionView = Backbone.Marionette.CollectionView.extend({
    itemView: SearchOrderItemView,
    emptyView: SearchOrderEmptyView,

    onBeforeItemAdded: function(itemView) {
      if(itemView.model.id) {
        var cls = itemView.model.get('active') ? 'active-order' : 'inactive-order';
        itemView.$el.addClass(cls);
      }
    }
  });

  var init = function() {
    var orderList = new OrderList();
    var searchCollectionView = new SearchOrderCollectionView({el: '.order-search-result', collection: orderList});
    orderList.fetch();
    var search = new Search();
    var searchView = new SearchView({model: search});
    searchView.render();
    search.on('change:term', function() {
      orderList.fetch({data: {search: this.get('term')}});
    });
  }

  return  {
    initialize: init
  };
})();
