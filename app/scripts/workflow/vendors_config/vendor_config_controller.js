define(['angularAMD', 'vendor-config-service', 'vendor-config-select-type-controller', 'vendor-config-basic-settings-controller' ,
    'vendor-config-permissions-controller'], function (angularAMD) {
    'use strict';

    angularAMD.controller('VendorConfigController', ['pageLoad', 'constants', 'vendorConfigService', function (pageLoad, constants, vendorConfigService) {
        var vm = this;

        // Hide page loader when the page is loaded
        pageLoad.hidePageLoader();

        vm.constants = constants;
        vm.vendorConfig = vendorConfigService.vendorConfig;

        vm.highlightLeftNav = function (pageNo) {
            var eachStepCompLabel = $('.eachStepCompLabel');

            eachStepCompLabel.removeClass('active');
            eachStepCompLabel[pageNo].classList.add('active');
        };
    }]);
});
