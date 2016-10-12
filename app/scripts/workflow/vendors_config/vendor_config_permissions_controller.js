define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('VendorConfigPermissionsController', ['constants',
        function (constants) {
        var vm = this;

        vm.constants = constants;
        vm.firstLevelSectionShow = true ;
        vm.secondLevelSectionShow = false ;
        vm.thirdLevelSectionShow = false ;

        vm.showSecondLevel = function () {
            vm.firstLevelSectionShow = false ;
            vm.secondLevelSectionShow = true ;
            vm.thirdLevelSectionShow = false ;
        };
        vm.showThirdLevel = function () {
            vm.firstLevelSectionShow = false ;
            vm.secondLevelSectionShow = false ;
            vm.thirdLevelSectionShow = true ;
        };
        vm.showHideDropdownWithSearch = function(event) {
            $(event.target).closest('.dropdown').find('.dropdown-menu-with-search').toggle() ;
        };

    }]);
});
