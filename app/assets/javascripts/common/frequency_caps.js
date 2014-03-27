(function(FrequencyCaps) {
  'use strict';

  FrequencyCaps.FrequencyCap = Backbone.Model.extend({
    //timeUnits: [ 'lifetime', 'minutes', 'hours', 'days', 'weeks', 'months' ],
    defaults: function() {
      return {
        impressions: 1,
        time_value: 1,
        time_type: 3
      }
    },

    toJSON: function() {
      return { frequency_cap: _.clone(this.attributes) };
    }
  });

  FrequencyCaps.FrequencyCapsList = Backbone.Collection.extend({
    model: FrequencyCaps.FrequencyCap
  });



})(ReachUI.namespace("FrequencyCaps"));
