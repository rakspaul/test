define(['angularAMD', 'vendor-config-service', 'vendor-config-select-type-controller', 'vendor-config-basic-settings-controller'], function (angularAMD) {
    'use strict';

    angularAMD.controller('VendorConfigController', ['pageLoad', 'constants', 'vendorConfigService', function (pageLoad, constants, vendorConfigService) {
        var vm = this;

        // Hide page loader when the page is loaded
        pageLoad.hidePageLoader();

        vm.constants = constants;
        vm.vendorConfig = vendorConfigService.vendorConfig;
        console.log('VENDOR CONFIG controller is loaded!');

        // initial initialization
        $(function () {
            // This is for the drop down list. Perhaps adding this to a more general controller
            $(document).on('click', '.dropdown-menu li.available a', function () {
                $(this)
                    .parents('.dropdown')
                    .find('.btn')
                    .find('.text').text($(this).text());

                $(this).parents('.dropdown').find('.btn').val($(this).data('value'));
            });
        });
    }]);
});
