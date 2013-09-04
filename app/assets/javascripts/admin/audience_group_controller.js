(function(AudienceGroup) {
  'use strict';

  AudienceGroup.DetailRegion = Backbone.Marionette.Region.extend({
    el: "#details.content"
  });

  AudienceGroup.Layout = Backbone.Marionette.Layout.extend({
    template: JST['templates/admin/audience_groups/audience_groups_layout'],

    regions: {
      content: '#audience_groups_details'
    },

  });

  AudienceGroup.Controller = Marionette.Controller.extend({
    initialize: function() {
      this._initializeLayout();
    },

    _initializeLayout: function() {
      this.detailRegion = new AudienceGroup.DetailRegion();

      this.layout = new AudienceGroup.Layout();
      this.detailRegion.show(this.layout);
    },

    initializeForCreateNewAudienceGroup: function() {
      var model = new AudienceGroup.AudienceGroupModel();
      this.audienceGroupController = new AudienceGroup.AudienceGroupController({
        mainRegion: this.layout.content
      });
      this.audienceGroupController.initializeForCreateNewAudienceGroup(model);
    },

    initializeForEditAudienceGroup: function(id) {
      var self = this;
      this.model = new AudienceGroup.AudienceGroupModel({id: id});
      this.model.fetch().then(function() {
        self.audienceGroupController = new AudienceGroup.AudienceGroupController({
          mainRegion: self.layout.content
        });
        self.audienceGroupController.initializeForEditAudienceGroup(self.model);
      });
    },


  });


})(ReachUI.namespace("AudienceGroups"));