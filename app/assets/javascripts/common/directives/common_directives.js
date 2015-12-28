(function () {
  'use strict';
    commonModule.directive('header', ['$http', '$compile','constants', function ($http, $compile,constants) {
    return {
        controller: function($scope, $cookieStore, $location){
            $scope.isCdeskSession = (!$cookieStore.get('cdesk_session') && $location.path() === '/login') ?  true : false;
           },
        restrict:'EAC',
        templateUrl: '',
        link: function(scope, element, attrs) {
            scope.textConstants = constants;
            var template;
            if (!scope.isCdeskSession) {
                $http.get(assets.html_header).then(function (tmpl) {
                    template = $compile(tmpl.data)(scope);
                    element.append(template);
                });
            }
        }
    };
  }]);

}());
