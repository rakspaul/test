 require.config({ // jshint ignore:line
      // alias libraries paths.  Must set 'angular'
      waitSeconds: 0,
      paths: {
        'angular': 'libs/angular.min',
        'angular-route': 'libs/angular-route',
        'angularAMD': 'libs/angularAMD',
        'jquery': 'libs/jquery',
        'jquery-ui': 'libs/jquery-ui',
        'bootstrap': 'libs/bootstrap',
        'date-picker': 'libs/bootstrap-datepicker.min',
        'angular-resource': 'libs/angular-resource',
        'angular-switch':'libs/angular-ui-switch.min',
        'angular-css':'libs/angular-css',
        'angular-cookies': 'libs/angular-cookies',
        'angular-cache': 'libs/angular-cache',
        'angulartics': 'libs/angulartics.min',
        'angulartics-ga': 'libs/angulartics-google-analytics.min',
        'angular-sanitize': 'libs/angular-sanitize',
        'bootstrap-toggle': 'libs/bootstrap-toggle',
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
        'ui-bootstrap-tpls': 'libs/ui-bootstrap-tpls-0.12.1.min',
        'showErrors': 'libs/showErrors.min',
        'd3': 'libs/d3',
        'lrInfiniteScroll': 'libs/lrInfiniteScroll',
        'filesaver': 'libs/FileSaver',
        'multiselect':'multi_select',
        'ng-tag': 'libs/ng-tags-input.min',
        'chosen': 'libs/chosen'
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
        'date-picker': ['jquery', 'jquery-ui', 'bootstrap', 'angular'],
        'ng-file-upload-shim': [],
        'ng-file-upload': ['angular'],
        'tmhDynamicLocale'   : ['angular'],
        'ng-infinite-scroll': ['angular-route'],
        'highcharts-ng': ['ng-infinite-scroll'],
        'highcharts': ['highcharts-ng'],
        'highcharts-more': ['highcharts'],
        'chosen': ['jquery'],
        'solid-gauge': ['highcharts-more'],
        'underscore': ['angular'],
        'd3': ['angulartics-ga'],
        'angular-sanitize': ['d3'],
        'filesaver':  ['angular-sanitize'],
        'ui-bootstrap-tpls':  ['filesaver'],
        'lrInfiniteScroll':  ['ui-bootstrap-tpls'],
        'angular-css':['angular'],
        'multiselect' : ['angular'],
        'bootstrap-toggle':['jquery'],
        'showErrors' :  ['angular'],
        'ng-tag': ['angular']
      },

      priority: [
        'angular'
      ],
      // kick start application
      deps: ['app']
    });
