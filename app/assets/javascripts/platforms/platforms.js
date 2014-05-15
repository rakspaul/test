(function(AdPlatforms) {
  'use strict';

  AdPlatforms.PlatformModel = Backbone.Model.extend({
    url: function() {
      if(this.isNew()) {
        return '/platforms';
      } else {
        return '/platforms/' + this.id + '.json';
      }
    },

    toJSON: function() {
      return { platform: _.clone(this.attributes) };
    },
  });

  AdPlatforms.MediaType = Backbone.Model.extend();


// --------------------/ Collection /----------------------------------

 AdPlatforms.PlatformList = Backbone.Collection.extend({
    model: AdPlatforms.PlatformModel,

    url: '/media_types/platforms/',
  });

  AdPlatforms.MediaTypeList = Backbone.Collection.extend({
    model: AdPlatforms.PlatformModel,

    url: '/media_types/media_types.json'
  });

})(ReachUI.namespace("AdPlatforms"));
