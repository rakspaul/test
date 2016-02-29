define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('popupMsg', function ($compile) {
            return {
                restrict : 'E',
                replace : true,
                link: function ($scope,element,attr) {
                    element.html($compile(angular.element(
                        '<div class="top_message_box" attr="test" ng-class="{\'red_msg\':' +
                        attr.ngShow +
                        '.isErrorMsg}" ng-show="' +
                        attr.ngShow +
                        '.message"><span class="msg_box"><span class="msg_icon">x</span><span class="msg_txt ng-binding" ng-bind-html="' +
                        attr.ngShow +
                        '.message"></span><span class="close_msg_box_holder">' +
                        '<span class="close_msg_box" ng-click="close_msg_box($event);">x</span></span></span></div>'
                    ))($scope));
                }
            };
        });
});
