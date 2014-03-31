;
(function(Backbone, _) {
  _.extend(Backbone.Collection.prototype, {
    nestedCollection: false,
    originalModels: {},
    deletedModels: [],

    initRORAttributes: function (models) {
      if (this.nestedCollection) {
        this.originalAttributes = models;
      }
      this.on('remove', this.removeFromModels);
    },

    removeFromModels: function(m) {
      var id = m.get('id');
      if (id) {
        this.deletedModels.push(id);
      }
    },

    toNestedAttributes: function() {
      var models = this.toJSON(),
          self = this,
          deleted = null;

      _.each(this.deletedModels, function(id) {
        deleted = _.where(self.originalAttributes, {"id": id});
        if (deleted.length > 0 ) {
          deleted[0]['_destroy'] = true;
          models.push(deleted[0]);
        }
      });
      return models;
    }
  });
})(Backbone, _);
