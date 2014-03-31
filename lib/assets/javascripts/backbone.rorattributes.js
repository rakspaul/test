;
(function(Backbone, _) {
  console.log('RoR attirbutes');
  _.extend(Backbone.Collection.prototype, {
    nestedCollection: false,
    nestedAttributes: {},

    /*initialize: function(options) {
      console.log('EXTENDED initialize');
      console.log(this.constructor);
      this.initRORAttributes(options);
    },*/

    initRORAttributes: function (options) {
      if (this.nestedCollection) {
        console.log(options);
      } else {

      }
    }
  });
})(Backbone, _);
