define(['angularAMD','../../common/services/constants_service'],function (angularAMD) {

    angularAMD.directive('campaignListFilterDirective', function (constants) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: assets.html_campaign_lst_filter,

            link: function ($scope, element, attrs) {
                $scope.constants = constants;
                $(".sliding_dropdown_btn , .close_sliding_dropdown ").click( function() {
                    $('.sliding_dropdown_container').toggle('slide', { direction: "right" }, 500);
                }) ;
            }
        };
    });

});
