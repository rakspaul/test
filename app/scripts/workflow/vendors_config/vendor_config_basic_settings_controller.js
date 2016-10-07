define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('VendorConfigBasicSettingsController', ['constants', function (constants) {
        var vm = this;

        console.log('VENDOR CONFIG BASIC SETTINGS controller is loaded!');

        vm.constants = constants;
        vm.foo = 'Vendor Config Basic Settings';
    }]);
});
