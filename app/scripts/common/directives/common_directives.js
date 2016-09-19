define(['angularAMD'],  function (angularAMD) {
    'use strict';

    angularAMD.directive('header', ['$http', '$compile', 'constants',  function ($http, $compile, constants) {
        return {
            controller:  function ($scope, $cookies, $location) {
                $scope.isCdeskSession = (!$cookies.get('cdesk_session') && $location.path() === '/login') ? true : false;
            },

            restrict: 'EAC',
            templateUrl: '',

            link:  function (scope, element) {
                var template;

                scope.textConstants = constants;

                if (!scope.isCdeskSession) {
                    $http
                        .get(assets.html_header)
                        .then( function (tmpl) {
                            template = $compile(tmpl.data)(scope);
                            element.append(template);
                        });
                }
            }
        };
    }]);
});
