define(['angularAMD'], function (angularAMD) {
        'use strict';

        angularAMD.factory('vendorConfigService', [function () {
            var vendorConfig = {
                id: 50,
                clientId: 77,
                vendorId: 207,
                vendorName: 'Sizmek',
                vendorTypeId: 2,
                vendorSeatId: null,
                currencyId: 2,
                name: 'Sizmek Adserving for Tegna Corp',
                description: '',
                enabled: false,
                useAsSor: false,
                isBillable: false,
                startDate: '10/01/2016',
                endDate: '12/20/2016',
                clientVendorOfferings: [
                    {
                        id: 67,
                        clientVendorConfigurationId: 50,
                        costCategory: {
                            id: 3,
                            name: 'Ad Serving',
                            description: 'Ad Serving '
                        },
                        name: 'Sizmek  Ad-Serving',
                        description: '',
                        rateType: {
                            id: 1,
                            name: 'CPM',
                            abbreviatedName: null,
                            description: 'Cost Per Mille',
                            billing: false
                        },
                        rateValue: 0.05
                    }
                ],
                clientConfigPermissions: [
                    {
                        metric: 'Impressions',
                        adFormat: ''
                    }
                ],
                clientConfigPreferences: [],
                vendor: {
                    id: 207,
                    name: 'Sizmek',
                    description: '',
                    companyURL: '',
                    iconURL: '/images/platform_favicons/sizmek.png',
                    vendorCapabilities: [],
                    vendorTypes: [
                        {
                            id: 2,
                            name: 'ADSERVING',
                            displayName: 'Ad Serving',
                            description: ''
                        }
                    ],
                    vendorSeatAuthTemplate: [],
                    formats: [
                        'DISPLAY',
                        'RICH MEDIA',
                        'VIDEO'
                    ]
                },
                currency: {
                    id: 2,
                    name: 'US DOLLAR',
                    currencyCode: 'USD',
                    currencySymbol: '$'
                },
                client: {
                    id: 77,
                    name: 'Tegna Corp',
                    code: 'C_77',
                    clientType: 'ORGANIZATION',
                    isBillable: true,
                    displayName: 'Tegna Corp (Mother of Dragons)',
                    isArchived: false,
                    geoTargetId: 171998,
                    timezone: 'US/Eastern',
                    currency: 1,
                    parentId: 0,
                    isLeafNode: false,
                    createdBy: 11568,
                    updatedBy: 11682,
                    createdAt: '2016-03-29 05:54:43.649',
                    updatedAt: '2016-06-13 08:27:35.779'
                }
            };

            return {
                vendorConfig: vendorConfig
            };
        }]);
    }
);
