(function(ReachClient) {
  'use strict';

// --------------------/ Region /------------------------------------

  ReachClient.DetailRegion = Backbone.Marionette.Region.extend({
    el: "#details.content"
  });

// --------------------/ Layout /------------------------------------

  ReachClient.Layout = Backbone.Marionette.Layout.extend({
    template: JST['templates/admin/reach_clients/reach_clients_layout'],

    regions: {
      content: '#content'
    },
  });

// --------------------/ Controllers /-------------------------------

  ReachClient.ReachClientController = Marionette.Controller.extend({
    initialize: function() {
      this._initializeLayout();
    },

    _initializeLayout: function() {
      this.detailRegion = new ReachClient.DetailRegion();

      this.layout = new ReachClient.Layout();
      this.detailRegion.show(this.layout);
    },

    initializeForCreateNewReachClient: function() {
      var model = new ReachClient.ReachClientModel();
      this.clientDetailsController = new ReachClient.ReachClientDetailsController({
        mainRegion: this.layout.content
      });
      this.clientDetailsController.createNewReachClient(model);
    },

    initializeForEditReachClient: function(id) {
      var self = this;
      this.model = new ReachClient.ReachClientModel({id: id});
      this.model.fetch().then(function() {
        self.clientDetailsController = new ReachClient.ReachClientDetailsController({
          mainRegion: self.layout.content
        });
        self.clientDetailsController.editReachClient(self.model);
      });
    },

  });

})(ReachUI.namespace("ReachClients"));