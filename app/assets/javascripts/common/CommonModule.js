
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
    apiSerivicesUrl: scala_api,
    apiSerivicesUrl_NEW:scala_api_NEW,
    workflow_apiServicesUrl: workflow_api,
    WORKFLOW_APIUrl : workflowCreate_api
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





if(window.location.hostname === "stg-apps.collective.com" || window.location.hostname === "localhost"  ){
    /* Issue Tracker I placed this here because it requires jquery to work
     and putting it in template was not working as JQUERY was not loaded yet and didn't want to include it more than once in the app
     */
    jQuery.ajax({
        url: "https://jira.collective.com/s/57dc6f3768f617b09896e8631175ee0d-T/en_USgr1u77/64022/93/1.4.26/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs.js?locale=en-US&collectorId=93f8e7e5",
        type: "get",
        cache: true,
        dataType: "script"
    });
}

