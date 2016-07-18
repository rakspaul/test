define(['angularAMD', '../../common/services/constants_service'], function (angularAMD) {
    'use strict';

    angularAMD.directive('campaignListFilterDirective', function (constants) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: assets.html_campaign_lst_filter,

            link: function ($scope) {
                var quickFilters = $('.sliding_dropdown_container_quick');

                $scope.constants = constants;

                $('.sliding_dropdown_btn , .close_sliding_dropdown, .filterClick').click( function() {
                    $('.sliding_dropdown_container_quick').toggle('slide', { direction: 'right' }, 500);
                });

                $(document).mouseup(function (e){
                    var container;

                    if (quickFilters.is(':visible') === true) {
                        e.stopImmediatePropagation();
                        container = $('.sliding_dropdown_container_quick');

                        // if the target of the click isn't the container...
                        // ... nor a descendant of the container
                        if (!container.is(e.target) && container.has(e.target).length === 0) {
                            container.toggle('slide', { direction: 'right' }, 500);
                        }
                    }
                });
            }
        };
    });
});
