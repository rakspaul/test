define(['angularAMD', 'vendor-config-service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('VendorConfigSelectTypeController', ['$timeout', 'vendorConfigService', 'dataService', 'vistoconfig',
        function ($timeout, vendorConfigService, dataService, vistoconfig) {
        var vm = this,
            clientId = 2, //vistoconfig.getMasterClientId(),
            baseUrl = vistoconfig.apiPaths.WORKFLOW_API_URL,
            vendorTypesUrl = baseUrl + '/vendor_types',
            vendorsUrl = baseUrl + '/clients/' + clientId + '/vendors';

        // Vendor Types fetched from API
        vm.vendorTypes = [];

        // Vendor Type currently selected from the dropdown box
        vm.selectedVendorType = {};

        // Vendor Types currently selected from the dropdown box (either "All Types" or specific type) to be used for Vendors display filter
        vm.selectedVendorTypes = [];

        // Vendors fetched from API
        vm.vendors = [];

        vm.selectVendor = function (event, vendor) {
            event.preventDefault();

            vendorConfigService.vendorConfig.vendorId = vendor.id;
            vendorConfigService.vendorConfig.vendorName = vendor.name;
            vendorConfigService.vendorConfig.vendor.id = vendor.id;
            vendorConfigService.vendorConfig.vendor.name = vendor.name;
            vendorConfigService.vendorConfig.vendor.iconURL = vendor.iconURL;

            $('.each-box-option').css('background', '#fff');
            $(event.currentTarget).css('background', '#e1edf9');
        };

        dataService
            .fetch(vendorTypesUrl, {cache: false})
            .then(function (result) {
                vm.vendorTypes = result.data.data;
                vm.vendorTypes.unshift({id: 0, displayName: 'All Types'});
                vm.selectedVendorTypes = vm.vendorTypes;
                vm.selectedVendorType = vm.vendorTypes[0];

                // Bind click event to update the selected vendor type
                $('.dropdown').on('click', 'a', function (e) {
                    e.preventDefault();
                    var selectedVendorTypeName = e.currentTarget.innerText;

                    $timeout(function () {
                        vm.selectedVendorType = _.find(vm.vendorTypes, function (item) {
                            return item.displayName === selectedVendorTypeName;
                        });
                    });
                });

                dataService
                    .fetch(vendorsUrl, {cache: false})
                    .then(function (result) {
                        vm.vendors = result.data.data;
                    });
            });
    }]);
});
