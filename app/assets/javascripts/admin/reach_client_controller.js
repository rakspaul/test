(function(ReachClient) {
  'use strict';

  ReachClient.DetailRegion = Backbone.Marionette.Region.extend({
    el: "#details.content"
  });

  ReachClient.Layout = Backbone.Marionette.Layout.extend({
    template: JST['templates/admin/reach_clients/reach_clients_layout'],

    regions: {
      content: '#content'
    },
  });

  ReachClient.ReachClientController = Marionette.Controller.extend({
    initialize: function() {
      this._initializeLayout();
      this._initializeClientDetailsController();
    },

    _initializeLayout: function() {
      this.detailRegion = new ReachClient.DetailRegion();

      this.layout = new ReachClient.Layout();
      this.detailRegion.show(this.layout);
    },

    _initializeClientDetailsController: function() {
      var model = new ReachClient.ReachClientModel();
      this.clientDetailsController = new ReachClient.ReachClientDetailsController({
        mainRegion: this.layout.content,
        model: model
      });
    },

  });

})(ReachUI.namespace("ReachClients"));