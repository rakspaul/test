(function () {
    'use strict';
    campaignListModule.directive('campaignListFilterDirective', function (utils,constants) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: assets.html_campaign_lst_filter,

            link: function ($scope, element, attrs) {
                $scope.constants = constants;
                $(".sliding_dropdown_btn , .close_sliding_dropdown ").click( function() {
                    $('.sliding_dropdown_container').toggle('slide', { direction: "left" }, 500);
                }) ;
            }
        };
    });

}());
