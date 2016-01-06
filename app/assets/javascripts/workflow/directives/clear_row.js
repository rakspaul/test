(function () {
    'use strict';
    angObj.directive('clearkpirow',function() {
        return function(scope, el, attr) {
            $(el).click(function(){
                scope.Campaign.kpiArr.splice(attr.index, 1);
                scope.ComputeCost();
                scope.$apply();
            })

        };
    })
    angObj.directive('clearcostrow',function() {
        return function(scope, el, attr) {
            $(el).click(function(){
                scope.Campaign.costArr.splice(attr.index, 1);
                scope.vendorRateData.splice(attr.index, 1);
                scope.ComputeCost();
                scope.$apply();
            })

        };
    })
    angObj.directive('hiddenkpi',function() {
        return function(scope, el, attr) {
            var model = attr['ngModel'];
            scope.$watch(model, function(nv) {
                if(nv) {
                    el.val(nv);
//                   scope.Schedule.dayPart[parseInt(attr.index)] = scope.Schedule.dayPart[parseInt(attr.index)] || {};
                    //scope.selectedDays[attr.index] = el.val();

                    scope.Campaign.kpiArr[parseInt(attr.index)][attr.field] = el.val();
//                    scope.Campaign.kpiArr[parseInt(attr.index)][attr.field] = nv.id;
                }
            });

        };
    });
    angObj.directive('hiddencost',function() {
        return function(scope, el, attr) {
            var model = attr['ngModel'];
            scope.$watch(model, function(nv) {
                if(nv) {
                    el.val(nv);
//                   scope.Schedule.dayPart[parseInt(attr.index)] = scope.Schedule.dayPart[parseInt(attr.index)] || {};
                    //scope.selectedDays[attr.index] = el.val();

                    scope.Campaign.costArr[parseInt(attr.index)][attr.field] = el.val();
//                    scope.Campaign.kpiArr[parseInt(attr.index)][attr.field] = nv.id;
                }
            });

        };
    });
}());