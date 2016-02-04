(function() {
  var vistoconfig = function () {
      this.screenTypeMap = {
          'desktop'     : 'icon-desktop' ,
          'unknown'     : 'icon-help'    ,
          'smartphone'  : 'icon-mobile'  ,
          'mobile'      : 'icon-mobile'  ,
          'tv'          : 'icon-desktop' ,
          'video'       : 'icon-video'   ,
          'set-top box' : 'icon-desktop' ,
          'tablet'      : 'icon-tablet'  ,
          'other'       : 'icon-image'   ,
          'social'      : 'icon-social'  ,
          'RICHMEDIA'   : 'icon-rich-media' ,
          'display'     : 'icon-desktop' ,
          'DISPLAY'     : 'icon-desktop'
      }

      this.formatTypeMap = {
          'desktop'     : 'icon-desktop' ,
          'unknown'     : 'icon-help'    ,
          'smartphone'  : 'icon-mobile'  ,
          'mobile'      : 'icon-mobile'  ,
          'tv'          : 'icon-desktop' ,
          'video'       : 'icon-video'   ,
          'social'      : 'icon-social'  ,
          'richmedia'   : 'icon-rich-media' ,
          'set-top box' : 'icon-desktop' ,
          'tablet'      : 'icon-tablet'  ,
          'other'       : 'icon-image'   ,
          'display'     : 'icon-desktop' ,
          'DISPLAY'     : 'icon-desktop'
      }

      this.PERFORMANCE_LINK= '/performance';
      this.PLATFORM_LINK= '/platform';
      this.COST_LINK = '/cost';
      this.INVENTORY_LINK = '/inventory';
      this.QUALITY_LINK = '/quality';
      this.OPTIMIZATION_LINK = '/optimization';
      this.MEDIA_PLANS_LINK = '/mediaplans'

  };

  commonModule.service("vistoconfig", vistoconfig);

}());
