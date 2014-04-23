(function(FrequencyCaps) {
  'use strict';

  FrequencyCaps.FrequencyCap = Backbone.Model.extend({
    //timeUnits: [ 'lifetime', 'minutes', 'hours', 'days', 'weeks', 'months' ],
    defaults: function() {
      return {
        impressions: 1,
        time_value: 1,
        time_unit: 2
      }
    },

    toJSON: function() {
      return _.clone(this.attributes);
    }
  }, {
    timeUnits: [ 'lifetime', 'minutes', 'hours', 'days', 'weeks', 'months' ]
  });

  FrequencyCaps.FrequencyCapsList = Backbone.Collection.extend({
    model: FrequencyCaps.FrequencyCap,
    nestedCollection: true,

    initialize: function(models, options) {
      this.initRORAttributes(models);
    }
  });



})(ReachUI.namespace("FrequencyCaps"));
