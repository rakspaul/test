define(['angularAMD'], function (angularAMD) {
        'use strict';

        angularAMD.factory('vendorConfigService', [function () {
            var vendorConfig = {
                id: 0,
                clientId: 0,
                vendorId: 0,
                vendorName: '',
                vendorTypeId: 0,
                currencyId: 0,
                name: '',
                description: '',
                isBillable: false,
                useAsSor: false,
                enabled: false,
                vendor: {
                    id: 0,
                    name: '',
                    description: '',
                    iconURL: ''
                }
            };

            return {
                vendorConfig: vendorConfig
            };
        }]);
    }
);
