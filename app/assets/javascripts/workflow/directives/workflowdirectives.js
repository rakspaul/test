(function () {
    'use strict';
    angObj.directive('creativeDropDown', function (utils, constants) {
        return {
            controller: function($scope, $cookieStore, $location){
            },
            scope: {},
            restrict:'EAC',
            templateUrl: assets.html_creative_drop_down,
            link: function($scope, element, attrs) {
                $scope.data = JSON.parse(attrs.data);
                $scope.dropdownType = attrs.type;
                console.log("directive");
                console.log($scope.data);

                //element.find('.clientsList_ul').show();

            }
        };
    });
}());
