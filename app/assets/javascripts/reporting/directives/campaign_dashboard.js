(function () {
    'use strict';
    angObj.directive('campaignDashboard', function (utils,constants) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: assets.html_campaign_dashboard,

            link: function ($scope, element, attrs) {

                $scope.textConstants = constants;

                $scope.getPendingWidth = function() {
                    var _total = $scope.campaigns.dashboard.pending ? $scope.campaigns.dashboard.pending.total : 0;
                    var _Total = $scope.campaigns.dashboard ? $scope.campaigns.dashboard.total : 0;       
                    return parseFloat((_total/_Total) * 100, 2) - 20;
                }

                $scope.getCompletedWidth = function() {
                    var _total = $scope.campaigns.dashboard.completed ? $scope.campaigns.dashboard.completed.total : 0;
                    var _Total = $scope.campaigns.dashboard ? $scope.campaigns.dashboard.total : 0;       
                    return parseFloat((_total/_Total) * 100, 2) + 10;
                }

                $scope.getActiveWidth = function() {
                    var _total = $scope.campaigns.dashboard.active ? $scope.campaigns.dashboard.active.total : 0;
                    var _Total = $scope.campaigns.dashboard ? $scope.campaigns.dashboard.total : 0;      
                    return parseFloat((_total/_Total) * 100, 2) + 10;
                }

                //internal band
                $scope.getDraftWidth = function() {
                    var _total = $scope.campaigns.dashboard.pending ? $scope.campaigns.dashboard.pending.draft : 0;
                    var _Total = $scope.campaigns.dashboard.pending ? $scope.campaigns.dashboard.pending.total : 0;       
                    return parseFloat((_total/_Total) * 100, 2);
                }

                $scope.getReadyWidth = function() {
                    var _total = $scope.campaigns.dashboard.pending ? $scope.campaigns.dashboard.pending.ready : 0;
                    var _Total = $scope.campaigns.dashboard.pending ? $scope.campaigns.dashboard.pending.total : 0;       
                    return parseFloat((_total/_Total) * 100, 2);
                }

                $scope.getActiveOnTrackWidth = function() {
                    var _total = $scope.campaigns.dashboard.active ? $scope.campaigns.dashboard.active.ontrack  : 0;
                    var _Total = $scope.campaigns.dashboard.active ? $scope.campaigns.dashboard.active.total : 0;       
                    return parseFloat((_total/_Total) * 100, 2);
                }

                $scope.getActiveUnderWidth = function() {
                    var _total = $scope.campaigns.dashboard.active ? $scope.campaigns.dashboard.active.underperforming: 0;
                    var _Total = $scope.campaigns.dashboard.active ? $scope.campaigns.dashboard.active.total: 0;       
                    return parseFloat((_total/_Total) * 100, 2);
                }

                $scope.getCompletedOnTrackWidth = function() {
                    var _total = $scope.campaigns.dashboard.completed ? $scope.campaigns.dashboard.completed.ontrack : 0;
                    var _Total = $scope.campaigns.dashboard.completed ? $scope.campaigns.dashboard.completed.total : 0;       
                    return parseFloat((_total/_Total) * 100, 2);
                }

                $scope.getCompletedUnderWidth = function() {
                    var _total = $scope.campaigns.dashboard.completed ? $scope.campaigns.dashboard.completed.underperforming: 0;
                    var _Total = $scope.campaigns.dashboard.completed ? $scope.campaigns.dashboard.completed.total : 0;       
                    return parseFloat((_total/_Total) * 100, 2);
                }

            } 
        };
    });

}());
