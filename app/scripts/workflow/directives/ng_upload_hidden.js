define(['angularAMD'],function (angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.directive('ngUpdateHidden', function() {
        return function(scope, el, attr) {
            var model = attr.ngModel;
            scope.$watch(model, function(nv) {
                el.val(nv);
            });

        };
    });
});
