var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('creativeListController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#creative_nav_link').addClass('active');
        $scope.textConstants = constants;
        $scope.workflowData = {};
        $scope.adData= {}
        $scope.adData.screenTypes =[];

        $scope.campaignId = $routeParams.campaignId;        
    });
})();

