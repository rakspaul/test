define(['angularAMD', 'brands-service'], function (angularAMD) {
    'use strict';

    angularAMD.factory('brandsModel', ['$q', '$timeout', '$location', 'brandsService', 'constants',
        'localStorageService', 'workflowService', 'pageFinder', function ($q, $timeout, $location, brandsService, constants, localStorageService, workflowService) {
            var brand = {
                    brandList: [],
                    selectedBrand: {brandId: -1, brandName: constants.ALL_BRANDS},
                    allBrandObject: {brandId: 0, brandName: constants.ALL_BRANDS},

                    //commented the below line as it shows for brand unknown when canned report page is loaded, need to check with Abhi -  Sapna
                    //unknownBrandObject: {id: 0, name: 'Unknown'}
                    unknownBrandObject: {brandId: 0, brandName: constants.ALL_BRANDS},
                    showList: false,
                    styleDisplay: 'block',
                    showAll: true,
                    enable: true,
                    cssClass: ''
                },

                previousAdvertiserId;

            return {
                fetchBrandList: function(accountId, advertiserId) {
                    var deferred = $q.defer();

                    accountId = Number(accountId);
                    advertiserId = Number(advertiserId);

                    if (previousAdvertiserId !== advertiserId) {
                        this.reset();
                    }

                    if (brand.brandList.length > 0) {
                        $timeout(function() {
                            deferred.resolve();
                        }, 10);

                        return deferred.promise;
                    }

                    workflowService
                        .getBrands(accountId, advertiserId, 'read')
                        .then(function (result) {
                            if (result && result.data.data.length > 0) {
                                brand.brandList = _.map(result.data.data, function (a) {
                                    return {'brandId': a.brandId, 'brandName': a.brandName};
                                });

                                brand.brandList = _.sortBy(brand.brandList, 'brandName');
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
                    brandId = Number(brandId);

                    if (brandId === 0) {
                        brand.selectedBrand = brand.unknownBrandObject;
                        return true;
                    }

                    if (brandId) {
                        brand.selectedBrand = _.find(brand.brandList, function(b) {
                            return brandId === b.brandId;
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

                getSelectedBrand: function () {
                    return brand.selectedBrand;
                },

                getBrandList: function() {
                    return brand.brandList;
                },

                disable: function () {
                    brand.enable = false;
                    brand.cssClass = 'brands_filter_disabled';
                },

                enable: function () {
                    brand.enable = true;
                    brand.cssClass = '';
                },

                reset: function() {
                    brand.brandList = [];
                    brand.selectedBrand = {brandId: -1, brandName: constants.ALL_BRANDS};
                }
            };
        }]);
});
