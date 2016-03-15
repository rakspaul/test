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
                quickFilters = $(".sliding_dropdown_container_quick");
                $(".sliding_dropdown_btn , .close_sliding_dropdown ").click( function() {
                    $('.sliding_dropdown_container_quick').toggle('slide', { direction: "right" }, 500);
                });
                
                $(document).mouseup(function (e){
                    if (quickFilters.is(':visible') == true) {
                        var container = $(".sliding_dropdown_container_quick");
                    
                        if (!container.is(e.target) // if the target of the click isn't the container...
                            && container.has(e.target).length === 0) // ... nor a descendant of the container
                        { container.toggle('slide', { direction: "right" }, 500); }
                    }
                });
            }
        };
    });
});
