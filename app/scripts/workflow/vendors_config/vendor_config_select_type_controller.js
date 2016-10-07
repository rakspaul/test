define(['angularAMD', 'vendor-config-service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('VendorConfigSelectTypeController', ['constants', 'vendorConfigService', 'dataService', 'vistoconfig',
        function (constants, vendorConfigService, dataService, vistoconfig) {
        var vm = this,
            clientId = 2, //vistoconfig.getMasterClientId(),
            baseUrl = vistoconfig.apiPaths.WORKFLOW_API_URL,
            vendorTypesUrl = baseUrl + '/vendor_types',
            vendorsUrl = baseUrl + '/clients/' + clientId + '/vendors';

        vm.constants = constants;

        // Vendor Types fetched from API
        vm.vendorTypes = [];

        // Vendor Type currently selected from the dropdown box
        vm.selectedVendorType = {};

        // Vendor Types currently selected from the dropdown box (either "All Types" or specific type) to be used for Vendors display filter
        vm.selectedVendorTypes = [];

        // Vendors fetched from API
        vm.vendors = [];

        vm.showHideVendors = function (vendorTypeId) {
            return vm.selectedVendorType.id === 0 || vm.selectedVendorType.id === vendorTypeId;
        };

        vm.updateSelectedVendorType = function (vendorType) {
            console.log('updateSelectedVendorType(), vendorType = ', vendorType);
            vm.selectedVendorType = vendorType;
        };

        vm.selectVendor = function (event, vendor) {
            vendorConfigService.vendorConfig.vendorId = vendor.id;
            vendorConfigService.vendorConfig.vendorName = vendor.name;
            vendorConfigService.vendorConfig.vendor.id = vendor.id;
            vendorConfigService.vendorConfig.vendor.name = vendor.name;
            vendorConfigService.vendorConfig.vendor.iconURL = vendor.iconURL;

            $('#vendors').find('.each-box-option').css('background', 'none');
            $(event.currentTarget).css('background', '#e1edf9');
            console.log($(event.currentTarget));
        };

        console.log('VENDOR CONFIG SELECT TYPE controller is loaded!');

        dataService
            .fetch(vendorTypesUrl, {cache: false})
            .then(function (result) {
                console.log('vendorTypes = ', result.data.data);
                vm.vendorTypes = result.data.data;
                vm.vendorTypes.unshift({id: 0, displayName: 'All Types'});
                vm.selectedVendorTypes = vm.vendorTypes;
                vm.selectedVendorType = vm.vendorTypes[0];

                // Bind click event to update the selected vendor type
                $('.dropdown').on('click', 'a', function (e) {
                    var selectedVendorTypeName = e.currentTarget.innerText;
                    console.log(e.currentTarget.innerText);

                    vm.selectedVendorType = _.find(vm.vendorTypes, function(item) {
                        return item.displayName === selectedVendorTypeName;
                    });

                    console.log(vm.selectedVendorType.id);

                    e.preventDefault();
                });

                dataService
                    .fetch(vendorsUrl, {cache: false})
                    .then(function (result) {
                        console.log(result.data.data);
                        vm.vendors = result.data.data;
                    });
            });
    }]);
});
