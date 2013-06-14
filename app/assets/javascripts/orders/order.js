(function(Orders) {
  'use strict';

  Orders.Order = Backbone.Model.extend({});

  Orders.OrderList = Backbone.Collection.extend({
    model: Orders.Order,
    url: '/orders/search.json'
  });

  Orders.ListItemView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/order_list_item'],
    className: 'order',
    triggers: {
      'click': 'selected'
    }
  });

  Orders.EmptyView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/order_search_empty'],
    className: 'no-order-found'
  });

  Orders.DetailView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/order_details'],
    className: 'order-details'
  });

  Orders.ListView = Backbone.Marionette.CollectionView.extend({
    itemView: Orders.ListItemView,
    emptyView: Orders.EmptyView,

    onBeforeItemAdded: function(itemView) {
      // This will make sure emptyView don't get style change
      if(itemView.model.id) {
        var cls = itemView.model.get('active') ? 'active-order' : 'inactive-order';
        itemView.$el.addClass(cls);
      }
    }
  });

  Orders.OrderDetailLayout = Backbone.Marionette.Layout.extend({
    template: JST['templates/orders/order_detail_layout'],

    regions: {
      detail: ".order-details-region",
      lineitems: ".lineitem-list"
    }
  });
})(ReachUI.namespace("Orders"));
