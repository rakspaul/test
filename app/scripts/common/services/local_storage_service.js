define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.factory('localStorageService', function () {
        return {
            masterClient: {
                set: function (data) {
                    localStorage.setItem('masterClient', JSON.stringify(data));
                },

                get: function () {
                    return localStorage.getItem('masterClient') && JSON.parse(localStorage.getItem('masterClient'));
                }
            },

            brand: {
                set: function (data) {
                    localStorage.setItem('setBrands', JSON.stringify(data));
                },

                get: function () {
                    return localStorage.getItem('setBrands') && JSON.parse(localStorage.getItem('setBrands'));
                },

                setDashboard: function (data) {
                    localStorage.setItem('dashboardBrand', JSON.stringify(data));
                },

                getDashboard: function () {
                    return localStorage.getItem('dashboardBrand') && JSON.parse(localStorage.getItem('dashboardBrand'));
                }
            },

            selectedCampaign: {
                set: function (data) {
                    localStorage.setItem('selectedCampaign', JSON.stringify(data));
                },

                get: function () {
                    return localStorage.getItem('selectedCampaign') &&
                        JSON.parse(localStorage.getItem('selectedCampaign'));
                },

                remove: function () {
                    return localStorage.removeItem('selectedCampaign');
                }
            },

            scheduleListReportType: {
                set: function (data) {
                    localStorage.setItem('scheduleListReportType', JSON.stringify(data));
                },

                get: function () {
                    return localStorage.getItem('scheduleListReportType') &&
                        JSON.parse(localStorage.getItem('scheduleListReportType'));
                },

                remove: function () {
                    return localStorage.removeItem('scheduleListReportType');
                }
            },

            campaignListFilter: {
                set: function (data) {
                    localStorage.setItem('campaignListFilter', JSON.stringify(data));
                },

                get: function () {
                    return localStorage.getItem('campaignListFilter') &&
                        JSON.parse(localStorage.getItem('campaignListFilter'));
                },

                remove: function () {
                    return localStorage.removeItem('campaignListFilter');
                }
            },

            adGroupDetails: {
                set: function (adGroup) {
                    localStorage.setItem('unallocatedAmount',
                        JSON.stringify(adGroup.deliveryBudget - adGroup.bookedSpend));
                    localStorage.setItem('groupBudget', JSON.stringify(adGroup.deliveryBudget));
                },

                get: function () {}
            },

            advertiser: {
                getDashboard: function() {
                    return localStorage.getItem('dashboardAdvertiser') &&
                        JSON.parse(localStorage.getItem('dashboardAdvertiser'));
                }
            },

            creativeTag: {
                set: function(data){
                    localStorage.setItem('creativeTag', JSON.stringify(data));
                },

                get: function(){
                    return JSON.parse(localStorage.getItem('creativeTag'));
                }
            }
        };
    });
});
