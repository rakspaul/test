(function () {
    'use strict';
    angObj.directive('ngUpdateHiddenDropdown',function() {
        return function(scope, el, attr) {
            var model = attr['ngModel'];
            scope.$watch(model, function(nv) {
                el.val(nv);
                scope.allPermissions.push(nv);
            });

        };
    })
}());