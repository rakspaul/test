define(['angularAMD'], function (angularAMD) {
  angularAMD.service("vistoconfig", function () {
      var urlPaths = {
        apiSerivicesUrl: scala_api,
        workflow_apiServicesUrl: workflow_api,
        WORKFLOW_APIUrl : workflowCreate_api
      };

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
      this.MEDIA_PLANS_LINK = '/mediaplans';

      this.api = scala_api;
      this.apiPaths = urlPaths;
  });
});
