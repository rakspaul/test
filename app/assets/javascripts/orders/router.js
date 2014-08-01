ReachUI.Orders.Router = Backbone.Marionette.AppRouter.extend({
  appRoutes: {
    '': 'index',
    'new': 'newOrder',
    ':id': 'orderDetails',
    ':id/edit': 'editOrder',
    ':id/lineitems/new': 'newLineItem',
    ':id/lineitems/:lineitem_id': 'showLineItem'
  },

  /*current : function() {
    var Router = this,
        fragment = Backbone.history.fragment,
        routes = _.pairs(Router.appRoutes),
        route = null, params = null, matched;

    matched = _.find(routes, function(handler) {
        route = _.isRegExp(handler[0]) ? handler[0] : Router._routeToRegExp(handler[0]);
        return route.test(fragment);
    });

    if(matched) {
        // NEW: Extracts the params using the internal
        // function _extractParameters
        params = Router._extractParameters(route, fragment);
        route = matched[1];
    }

    return {
        route : route,
        fragment : fragment,
        params : params
    };
  }*/
});

ReachUI.Orders.RestrictedRouter = Backbone.Marionette.AppRouter.extend({
  appRoutes: {
    '': 'index',
    ':id': 'orderDetails',
    ':id/lineitems/:lineitem_id': 'showLineItem'
  }
});