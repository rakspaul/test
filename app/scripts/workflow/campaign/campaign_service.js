define(['angularAMD'],
    function (angularAMD) {
        'use strict';

        angularAMD.factory('campaignService', function () {

            var rates,

            setRateTypes = function (r) {
                rates = r;
            },

            getRateTypes = function () {
                return rates;
            },
            processVendorConfig = function (data) {
                var processedData = {},
                    i,
                    j,
                    permission,
                    config;

                processedData.userPermission = [];
                processedData.configs = [];

                for (j = 0; j < data.length; j++) {
                    if (data[j].clientConfigPermissions.length > 0 && data[j].clientVendorOfferings.length > 0) {
                        for (i = 0; i < data[j].clientConfigPermissions.length; i++) {
                            permission = {};

                            if (data[j].clientConfigPermissions[i]) {
                                permission.vendorName = data[j].vendorName;
                                permission.configName = data[j].name;
                                permission.metric = data[j].clientConfigPermissions[i].metric;
                                permission.adFormat = data[j].clientConfigPermissions[i].adFormat;
                                processedData.userPermission.push(permission);
                            }
                        }

                        //vendor config object creation
                        for (i = 0; i < data[j].clientVendorOfferings.length; i++) {
                            config = {};
                            config.vendorName = data[j].vendorName;
                            config.configName = data[j].name;
                            config.adFormat = data[j].clientVendorOfferings[i].name;

                            config.rate = data[j].currency.currencySymbol + ' ' + 
                                data[j].clientVendorOfferings[i].rateValue.toFixed(2) + ' ' + data[j].clientVendorOfferings[i].rateType.name;

                            config.category = data[j].clientVendorOfferings[i].costCategory.name;
                            processedData.configs.push(config);
                        }
                    }
                }

                return processedData;
            };

            return {
                setRateTypes: setRateTypes,
                getRateTypes: getRateTypes,
                processVendorConfig: processVendorConfig


            };
        });
    }
);
