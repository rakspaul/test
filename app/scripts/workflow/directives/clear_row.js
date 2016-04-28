define(['angularAMD'],function (angularAMD) {
    'use strict';

    angularAMD.directive('clearrow',function() {
        return function(scope, el, attr) {
            $(el).click(function(){
                scope.Schedule.dayPart.splice(attr.index, 1);
                scope.Schedule.daytimeArr.splice(attr.index, 1);
                scope.Schedule.customLength -= 1;
                scope.changeDayTime();
                scope.$apply();
            })

        };
    });
});
