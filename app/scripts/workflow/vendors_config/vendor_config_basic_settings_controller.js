define(['angularAMD', 'vendor-config-service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('VendorConfigBasicSettingsController', ['$timeout', 'vendorConfigService', 'dataService', 'vistoconfig', 'loginModel',
        function ($timeout, vendorConfigService, dataService, vistoconfig, loginModel) {
        var vm = this,
            clientId = vistoconfig.getMasterClientId(),
            baseUrl = vistoconfig.apiPaths.WORKFLOW_API_URL,
            currencyUrl = baseUrl + '/currencies',
            contractOwnersUrl = baseUrl + '/clients/' + clientId + '/descendants',
            selectedClientUrl = baseUrl + '/clients/' + clientId;


        vm.vendorConfig = vendorConfigService.vendorConfig;

        console.log('VENDOR CONFIG BASIC SETTINGS controller is loaded!');

        // Contract Owners (Clients) fetched from API
        vm.contractOwners = [];

        // Contract Owner currently selected from the dropdown box
        vm.selectedContractOwner = {};

        // Currency list fetched from API
        vm.currencies = [];

        // Currency currently selected from the dropdown box
        vm.selectedCurrency = {};

        vm.selectContractOwner = function (event, contractOwner) {
            event.preventDefault();

            vm.selectedContractOwner = contractOwner;
            vendorConfigService.vendorConfig.client = contractOwner;
        };

        vm.selectCurrency = function (event, currency) {
            event.preventDefault();

            vm.selectedCurrency = currency;
            vendorConfigService.vendorConfig.currencyId = currency.id;
            vendorConfigService.vendorConfig.currency = currency;
        };

        vm.toggleButtonClicked = function (e, name) {
            $timeout(function () {
                if (name === 'enabled') {
                    vm.vendorConfig.enabled = !vm.vendorConfig.enabled;
                } else if (name === 'useAsSor') {
                    vm.vendorConfig.useAsSor = !vm.vendorConfig.useAsSor;
                } else if (name === 'isBillable') {
                    vm.vendorConfig.isBillable = !vm.vendorConfig.isBillable;
                }
            });
        };

        dataService
            .fetch(contractOwnersUrl, {cache: false})
            .then(function (result) {
                vm.contractOwners = result.data.data;

                dataService
                    .fetch(selectedClientUrl, {cache: false})
                    .then(function (result) {
                        vm.contractOwners.unshift(result.data.data);
                        vm.selectedContractOwner = vm.contractOwners[0];
                        vendorConfigService.vendorConfig.client = vm.selectedContractOwner;
                        console.log('contract Owners = ', vm.contractOwners);
                    });
            });

        dataService
            .fetch(currencyUrl, {cache: false})
            .then(function (result) {
                vm.currencies = result.data.data;

                vm.currencies = vm.currencies.sort(function (a, b) {
                    if (a.id > b.id) {
                        return 1;
                    } else if (a.id < b.id) {
                        return -1;
                    } else {
                        return 0;
                    }
                });

                vm.selectedCurrency = vm.currencies[0];
                console.log('currency = ', vm.currencies);
            });


        $(function () {
            $timeout(function () {
                $('.input-daterange').datepicker({
                    format: 'mm/dd/yyyy',
                    orientation: 'auto',
                    autoclose: true,
                    todayHighlight: true
                });

                $('.toggle').bootstrapToggle();
            });
        });
    }]);
});
