define(['angularAMD', '../services/constants_service'], function(angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.directive('header', ['$http', '$compile', 'constants', function($http, $compile, constants) {
        return {
            controller: function($scope, $cookieStore, $location) {
                $scope.isCdeskSession =
                    (!$cookieStore.get('cdesk_session') && $location.path() === '/login') ? true : false;
            },

            restrict: 'EAC',
            templateUrl: '',

            link: function(scope, element) {
                var template;

                scope.textConstants = constants;

                if (!scope.isCdeskSession) {
                    $http
                        .get(assets.html_header) // jshint ignore:line
                        .then(function(tmpl) {
                            template = $compile(tmpl.data)(scope);
                            element.append(template);
                        });
                }
            }
        };
    }]);
});