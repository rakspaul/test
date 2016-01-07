(function() {
  var vistoconfig = function () {
      this.screenTypeMap = {
          'desktop'     : 'icon-desktop' ,
          'unknown'     : 'icon-help'    ,
          'smartphone'  : 'icon-mobile'  ,
          'mobile'      : 'icon-mobile'  ,
          'tv'          : 'icon-desktop' ,
          'video'       : 'icon-video' ,
          'set-top box' : 'icon-desktop' ,
          'tablet'      : 'icon-tablet'  ,
          'other'       : 'icon-image'   ,
          'display'     : 'icon-desktop' ,
          'DISPLAY'     : 'icon-desktop'
      }

      this.formatTypeMap = {
          'desktop'     : 'icon-desktop' ,
          'unknown'     : 'icon-help'    ,
          'smartphone'  : 'icon-mobile'  ,
          'mobile'      : 'icon-mobile'  ,
          'tv'          : 'icon-desktop' ,
          'video'       : 'icon-video' ,
          'set-top box' : 'icon-desktop' ,
          'tablet'      : 'icon-tablet'  ,
          'other'       : 'icon-image'   ,
          'display'     : 'icon-desktop' ,
          'DISPLAY'     : 'icon-desktop'
      }
  };

  commonModule.service("vistoconfig", vistoconfig);

}());
