(function(FrequencyCaps) {
  'use strict';

  FrequencyCaps.FrequencyCap = Backbone.Model.extend({
    //timeUnits: [ 'lifetime', 'minutes', 'hours', 'days', 'weeks', 'months' ],
    defaults: function() {
      return {
        impressions: 1,
        time_value: 1,
        time_unit: 3
      }
    },

    toJSON: function() {
      return _.clone(this.attributes);
    }
  });

  FrequencyCaps.FrequencyCapsList = Backbone.Collection.extend({
    model: FrequencyCaps.FrequencyCap,
    nestedCollection: true,

    initialize: function(options) {
      this.initRORAttributes(options);
    }
  });



})(ReachUI.namespace("FrequencyCaps"));
