/**
 * Created by collective on 10/08/15.
 */
(function () {
    'use strict';
    collectiveReportModule.directive('editReport', ['utils', function (utils) {
        return {
            restrict: 'EAC',
            scope: {
                report:"=",
                campaign:"="
            },
            templateUrl: assets.html_edit_collective_report,
            templateUrl: assets.html_delete_collective_report,
            link: function(scope, element, attrs) {

            }
        };
    }]);

}());

