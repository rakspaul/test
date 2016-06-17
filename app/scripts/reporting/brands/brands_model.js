define(['angularAMD', 'reporting/brands/brands_service', 'common/services/constants_service', 'reporting/subAccount/sub_account_model'], function (angularAMD) {
    'use strict';
    angularAMD.service("brandsModel", function ($q, $timeout, $location, brandsService, constants, subAccountModel, localStorageService, workflowService) {

        var brand = {
            brandList: [],
            selectedBrand: {id: -1, name: constants.ALL_BRANDS},
            allBrandObject: {id: -1, name: constants.ALL_BRANDS},
            unknownBrandObject: {id: 0, name: 'Unknown'}
        },
        previousAdvertiserId;

        // var brand = {};
        // brand.allBrandObject = {id: -1, name: constants.ALL_BRANDS};
        // brand.selectedBrand = brand.allBrandObject;
        // brand.selectedDashboardBrand = brand.allBrandObject;
        brand.showList = false;
        brand.styleDisplay = "block";
        brand.showAll = true;
        brand.enable = true;
        brand.cssClass = "";
        // var brands = [brand.allBrandObject];
//TODO: to be moved to new service
        var pageFinder = function(path) {
            var pageName;
            if (path.endsWith('dashboard')) {
                pageName = 'dashboard';
            } else if (path.endsWith('mediaplans')) {
                pageName = 'mediaplans';
            } else if (path.split('/').indexOf('mediaplans') > 0) {
                pageName = 'reports';
            }

            return {
                isDashboardPage: function() {
                    return pageName == 'dashboard';
                },
                isMediaplansPage: function() {
                    return pageName == 'mediaplans';
                },
                isReportsPage: function() {
                    return pageName == 'reports';
                }
            };
        };


        return {
            // getBrands: function (success, searchCritera, search) {
            //     if (searchCritera.advertiserId != -1) {
            //         brandsService.fetchBrands(searchCritera).then(function (response) {
            //             //Note: Here search represents, only matching entries list.
            //             var resData = response.data.data;
            //             if (search) {
            //                 brands = [];
            //                 brands.push(brand.allBrandObject);
            //             }
            //             brands = [{id: -1, name: constants.ALL_BRANDS}].concat(resData);//brands.concat(resData);
            //             brand.totalBrands = brands.length;
            //             success.call(this, brands);
            //         });
            //     } else {
            //         success.call();
            //     }
            // },
            fetchBrandList: function(accountId, advertiserId) {
                if (previousAdvertiserId != advertiserId) {
                    this.reset();
                }
                var deferred = $q.defer();
                if (brand.brandList.length > 0) {
                    console.log('fetchBrandList ', 'already fetched');
                    $timeout(function() {
                        deferred.resolve();
                    }, 10);
                    return deferred.promise;
                }
                workflowService.getBrands(accountId, advertiserId, 'read').then(function (result) {
                    if (result && result.data.data.length > 0) {
                        brand.brandList = _.map(result.data.data, function(a) {
                            return {'id': a.id, 'name': a.name};
                        });
                        brand.brandList = _.sortBy(brand.brandList, 'name')
                        brand.brandList.unshift(brand.allBrandObject);
                        console.log('fetchBrandList is fetched');
                    } else {
                        brand.brandList = [brand.allBrandObject];
                    }
                    previousAdvertiserId = advertiserId;
                    deferred.resolve();
                });
                return deferred.promise;
            },

            allowedBrand: function(brandId) {
                if (brandId == 0) {
                    brand.selectedBrand = brand.unknownBrandObject;
                    return true;
                }
                // var accountIdParam = subAccountIdParam();
                if (brandId) {
                    brand.selectedBrand = _.find(brand.brandList, function(b) {
                        return brandId == b.id;
                    });
                    if (brand.selectedBrand) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    brand.selectedBrand = brand.allBrandObject;
                }
                return true;
            },            

            // setSelectedBrand: function (_brand) {
                // var isLeafNode = localStorageService.masterClient.get().isLeafNode;
                // var isDashboardSubaccount = subAccountModel.isDashboardSubAccount();

                // if (!isLeafNode && isDashboardSubaccount) {
                //     localStorageService.brand.setDashboard(_brand);
                // } else {
                //     brand.selectedBrand = _brand;
                //     localStorageService.brand.set(_brand);
                // }
                    // localStorageService.brand.set(_brand);
            // },
            getSelectedBrand: function () {
                // var isLeafNode = localStorageService.masterClient.get().isLeafNode;
                // var isDashboardSubaccount = subAccountModel.isDashboardSubAccount();

                // if (!isLeafNode && isDashboardSubaccount) {
                //   var  brands = localStorageService.brand.getDashboard();
                //     if(brands !== null) {
                //         brand.selectedDashboardBrand = brands;
                //     }
                //     return brand.selectedDashboardBrand;
                // } else {
                //    var brands = localStorageService.brand.get();
                //     if(brands !== null) {
                //         brand.selectedBrand = brands;
                //     } else {
                //         brand.selectedBrand = brand.allBrandObject;
                //     }
                //     return  brand.selectedBrand;
                // }
                return brand.selectedBrand;
            },
            // getBrand: function () {
            //     return brand;
            // },
            // getAllBrand: function () {
            //     return brand.allBrandObject;
            // },

            getBrandList: function() {
                return brand.brandList;
            },

            disable: function () {
                brand.enable = false;
                brand.cssClass = "brands_filter_disabled";
            },
            enable: function () {
                brand.enable = true;
                brand.cssClass = "";
            },

            reset: function() {
                brand.brandList = [];
                brand.selectedBrand = {id: -1, name: constants.ALL_BRANDS};
            },

            changeBrand: function(accountId, subAccountId, advertiserId, brand) {

                var url = '/a/' + accountId;
                subAccountId && (url += '/sa/' + subAccountId);
                // All Advertisers id is -1 and don't show it in the URL
                (advertiserId > 0) && (url += '/adv/' + advertiserId);
                (brand.id > 0) && (url += '/b/' + brand.id);

                var page = pageFinder($location.path());
                if (page.isDashboardPage()) {
                    url += '/dashboard';
                } else if (page.isMediaplansPage()) {
                    url += '/mediaplans';
                } else if (page.isReportsPage()) {
                    var reportName = _.last($location.path().split('/'));
                    url += '/mediaplans/reports/' + reportName;
                }
                console.log('change the url', url);
                $location.url(url);
            }

            // callBrandBroadcast: function (brand, advertiser, event_type) {
            //     brandsService.preForBrandBroadcast(brand, advertiser, event_type);
            // },

            // totalBrands: function () {
            //     return brands.length - 1;
            // }

        };
    });
});
