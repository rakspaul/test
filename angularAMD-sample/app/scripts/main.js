require.config({
  baseUrl: 'scripts/',

  // alias libraries paths.  Must set 'angular'
  paths: {
    'angular': 'libs/angular',
    'angular-route': 'libs/angular-route',
    'angularAMD': 'libs/angularAMD',
    'jquery': 'libs/jquery',
    'jquery-ui': 'libs/jquery-ui',
    'bootstrap': 'libs/bootstrap',
    'ngload': 'libs/ngload',
    'angular-resource': 'libs/angular-resource',
    'angular-switch':'libs/angular-ui-switch',
    'angular-css':'libs/angular-css',
    'angular-cookies': 'libs/angular-cookies',
    'angular-cache': 'libs/angular-cache',
    'angulartics': 'libs/angulartics.min',
    'angulartics-ga': 'libs/angulartics-google-analytics.min',
    'angular-sanitize': 'libs/angular-sanitize',
    'date-picker': 'libs/bootstrap-datepicker',
    'moment': 'libs/moment',
    'moment-tz': 'libs/moment-timezone',
    'ng-file-upload': 'libs/ng-file-upload',
    'ng-file-upload-shim': 'libs/ng-file-upload-shim',
    'tmhDynamicLocale': 'libs/tmhDynamicLocale',
    'ng-infinite-scroll': 'libs/ng-infinite-scroll',
    'highcharts': 'libs/highcharts',
    'highcharts-ng': 'libs/highcharts-ng',
    'highcharts-more': 'libs/highcharts-more',
    'solid-gauge': 'libs/solid-gauge',
    'underscore': 'libs/underscore',
    'ui-bootstrap-tpls': 'libs/ui-bootstrap-tpls-1.2.0.min',
    'd3': 'libs/d3',
    'lrInfiniteScroll': 'libs/lrInfiniteScroll',
    'filesaver': 'libs/filesaver',
      'multiselect':'multi_select'
  },

  // Add angular modules that does not support AMD out of the box, put it in a shim
  shim: {
    'jquery': {exports:'jquery'},
    'jquery-ui': {deps: ['jquery']},
    'bootstrap': ['jquery'],
    'angular': {
        deps: ['bootstrap'],
              exports: 'angular'
            },
    'angularAMD': ['angular'],
    'angular-route': ['angular-resource'],
    'angular-resource': ['angular-cookies'],
    'angular-switch':['angular'],
    'angular-cookies': ['angular-cache'],
    'angular-cache': ['angular'],
    'angulartics': ['angular'],
    'angulartics-ga': ['angulartics'],
    'date-picker': ['jquery', 'bootstrap'],
    'ng-file-upload-shim': [],
    'ng-file-upload': ['angular'],
    'tmhDynamicLocale'   : ['angular'],
    'ng-infinite-scroll': ['angular-route'],
    'highcharts-ng': ['ng-infinite-scroll'],
    'highcharts': ['highcharts-ng'],
    'highcharts-more': ['highcharts'],
    'solid-gauge': ['highcharts-more'],
    'underscore': ['angular'],
    'd3': ['angulartics-ga'],
    'angular-sanitize': ['d3'],
    'filesaver':  ['angular-sanitize'],
    'ui-bootstrap-tpls':  ['filesaver'],
    'lrInfiniteScroll':  ['ui-bootstrap-tpls'],
    'angular-css':['angular'],
    'multiselect' : ['angular']
  },

  priority: [
    'angular'
  ],
  // kick start application
  deps: ['app']
});
