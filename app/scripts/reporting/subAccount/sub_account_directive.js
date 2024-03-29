define(['angularAMD','sub-account-controller'], function (angularAMD) {
    'use strict';

    angularAMD.directive('subAccountDropDown',  function () {
        return {
            restrict: 'EAC',
            controller: 'subAccountController',
            templateUrl: assets.html_sub_account_drop_down,

            link: function() {
                $('.subAccountList_ul').scrollWithinDiv();
            }
        };
    });
});
