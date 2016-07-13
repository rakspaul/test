define(['angularAMD','reporting/subAccount/sub_account_controller'], function (angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.directive('subAccountDropDown',  function () {
        return {
            restrict: 'EAC',
            controller: 'subAccountController',
            templateUrl: assets.html_sub_account_drop_down, // jshint ignore:line

            link: function() {
                $('.subAccountList_ul').scrollWithInDiv();
            }
        };
    });
});

