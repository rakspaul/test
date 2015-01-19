
var underscore = angular.module('underscore', []);
underscore.factory('_', function() {
  return window._; // assumes underscore has already been loaded on the page
})

var commonModule = angular.module('commonModule',
  ['ngResource', //ngResource module when querying and posting data to a REST API.
  'ngRoute',    //ngRoute to enable URL routing to your application
  'ngCookies',
  'highcharts-ng',
  'infinite-scroll',
  'underscore'])
.constant('campaign_api', '')
.constant('api', scala_api)

 var urlPaths = {
 apiSerivicesUrl: scala_api
 };
 commonModule.constant('apiPaths', urlPaths);

 var colorArray = ["#7ED86C", "#2C417F", "#FF9F19", "#A750E5", "#6C717F", "#3F7F57", "#7F4F2C", "#3687D8", "#B235B2"];
commonModule.constant('actionColors',colorArray);


commonModule.constant('common', {
 title: 'Collective Desk',
 selectTab:$(".main_navigation").find('.active').removeClass('active').end(),
 //        useTempData:'tempdata' //null for actual api endpoint
 useTempData: null
 });