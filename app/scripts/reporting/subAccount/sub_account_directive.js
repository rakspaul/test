define(['angularAMD','reporting/subAccount/sub_account_controller'],function (angularAMD) {
    'use strict';
    angularAMD.directive('subAccountDropDown',  function () {
        return {
            restrict: 'EAC',
            controller: 'subAccountController',
            templateUrl: assets.html_sub_account_drop_down,
            link: function(scope, element, attrs) {
                $('.subAccountList_ul').scrollWithInDiv();
            }
        };
    });

});

