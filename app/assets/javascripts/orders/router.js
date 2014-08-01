ReachUI.Orders.Router = Backbone.Marionette.AppRouter.extend({
  appRoutes: {
    '': 'index',
    'new': 'newOrder',
    ':id': 'orderDetails',
    ':id/edit': 'editOrder',
    ':id/lineitems/new': 'newLineItem',
    ':id/lineitems/:lineitem_id': 'showLineItem'
  }
});

ReachUI.Orders.RestrictedRouter = Backbone.Marionette.AppRouter.extend({
  appRoutes: {
    '': 'index',
    ':id': 'orderDetails',
    ':id/lineitems/:lineitem_id': 'showLineItem'
  }
});