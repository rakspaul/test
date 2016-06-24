define(['angularAMD', 'reporting/brands/brands_service', 'common/services/constants_service', 'reporting/subAccount/sub_account_model'], function (angularAMD) {
    'use strict';
    angularAMD.factory("brandsModel", function (brandsService, constants, subAccountModel, localStorageService) {

        var brand = {};
        brand.allBrandObject = {id: -1, name: constants.ALL_BRANDS};
        brand.selectedBrand = brand.allBrandObject;
        brand.selectedDashboardBrand = brand.allBrandObject;
        brand.showList = false;
        brand.styleDisplay = "block";
        brand.showAll = true;
        brand.enable = true;
        brand.cssClass = "";
        var brands = [brand.allBrandObject];

        return {
            getBrands: function (success, searchCritera, search) {
                if (searchCritera.advertiserId != -1) {
                    brandsService.fetchBrands(searchCritera).then(function (response) {
                        //Note: Here search represents, only matching entries list.
                        var resData = response.data.data;
                        if (search) {
                            brands = [];
                            brands.push(brand.allBrandObject);
                        }
                        brands = [{id: -1, name: constants.ALL_BRANDS}].concat(resData);//brands.concat(resData);
                        brand.totalBrands = brands.length;
                        success.call(this, brands);
                    });
                } else {
                    success.call();
                }
            },
            setSelectedBrand: function (_brand) {
                var isLeafNode = localStorageService.masterClient.get().isLeafNode;
                var isDashboardSubaccount = subAccountModel.isDashboardSubAccount();

                if (!isLeafNode && isDashboardSubaccount) {
                    localStorageService.brand.setDashboard(_brand);
                } else {
                    brand.selectedBrand = _brand;
                    localStorageService.brand.set(_brand);
                }
            },
            getSelectedBrand: function () {
                var isLeafNode = localStorageService.masterClient.get().isLeafNode;
                var isDashboardSubaccount = subAccountModel.isDashboardSubAccount();

                if (!isLeafNode && isDashboardSubaccount) {
                  var  brands = localStorageService.brand.getDashboard();
                    if(brands !== null) {
                        brand.selectedDashboardBrand = brands;
                    }
                    return brand.selectedDashboardBrand;
                } else {
                   var brands = localStorageService.brand.get();
                    if(brands !== null) {
                        brand.selectedBrand = brands;
                    } else {
                        brand.selectedBrand = brand.allBrandObject;
                    }
                    return  brand.selectedBrand;
                }
            },
            getBrand: function () {
                return brand;
            },
            getAllBrand: function () {
                return brand.allBrandObject;
            },
            disable: function () {
                brand.enable = false;
                brand.cssClass = "brands_filter_disabled";
            },
            enable: function () {
                brand.enable = true;
                brand.cssClass = "";
            },

            callBrandBroadcast: function (brand, advertiser, event_type) {
                brandsService.preForBrandBroadcast(brand, advertiser, event_type);
            },

            totalBrands: function () {
                return brands.length - 1;
            }

        };
    });
});
