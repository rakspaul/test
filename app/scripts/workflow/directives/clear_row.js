define(['angularAMD'],function (angularAMD) {
    'use strict';
    angularAMD.directive("clearkpirow", function() {
        return function(scope, el, attr) {
            $(el).click(function(){
                var kpi=scope.Campaign.kpiArr[attr.index].kpiType;
                scope.Campaign.kpiArr.splice(attr.index, 1);
                scope.changeCostArrOnKpiRemoval(kpi);/*if there is no KPItype for the respective costType, change costType(calculation) to another type*/
                scope.ComputeCost();
                scope.$apply();
            })

        };
    });
    angularAMD.directive('clearcostrow',function() {
        return function(scope, el, attr) {
            $(el).click(function(){
                scope.Campaign.costArr.splice(attr.index, 1);
                scope.vendorRateData.splice(attr.index, 1);
                scope.ComputeCost();
                scope.$apply();
            })

        };
    });
    angularAMD.directive('hiddenkpi',function() {
        return function(scope, el, attr) {
            var model = attr['ngModel'];
            scope.$watch(model, function(nv) {
                if(nv) {
                    el.val(nv);
                    scope.Campaign.kpiArr[parseInt(attr.index)][attr.field] = el.val();
                }
            });

        };
    });
    angularAMD.directive('hiddencost',function() {
        return function(scope, el, attr) {
            var model = attr['ngModel'];
            scope.$watch(model, function(nv) {
                if(nv) {
                    el.val(nv);
                    scope.Campaign.costArr[parseInt(attr.index)][attr.field] = el.val();
                }
            });
        };
    });
});
