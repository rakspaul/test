define(['angularAMD'],function (angularAMD) {
    'use strict';
    angularAMD.directive("customDatePicker", function() {
        return {
            // Restrict it to be an attribute in this case
            restrict: 'A',
            // responsible for registering DOM listeners as well as updating the DOM
            link: function(scope, element, attrs) {
                $(element).datepicker(scope.$eval(attrs.customDatePicker)).on('hide', function(e) {
                    scope.$parent.closeDatePickerHandler && scope.$parent.closeDatePickerHandler(element);
                });
            }
        };
    });
});
