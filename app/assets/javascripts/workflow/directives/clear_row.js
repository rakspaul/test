(function () {
    'use strict';
    angObj.directive('clearkpirow',function() {
        return function(scope, el, attr) {
            $(el).click(function(){
                scope.Campaign.kpiArr.splice(attr.index, 1);
                scope.$apply();
            })

        };
    })
    angObj.directive('clearcostrow',function() {
        return function(scope, el, attr) {
            $(el).click(function(){
                scope.Campaign.costArr.splice(attr.index, 1);
                scope.$apply();
            })

        };
    })
}());