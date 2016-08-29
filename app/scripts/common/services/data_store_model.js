define(['angularAMD', 'common-utils'], function (angularAMD) {
    'use strict';

    angularAMD.service('dataStore', function () {
        var CachedObject = function (val) {
            this.cachedOn = new Date();
            this.value = val;

            // 30 mins in milliseconds
            this.expiryTime = 30 * 60 * 1000;

            this.isStale = function () {
                var dataAge = new Date() - this.cachedOn;

                if (dataAge > this.expiryTime) {
                    return true;
                }

                return false;
            };

            // get time until this data object's expiry in milliseconds
            this.getRemainingTime = function () {
                return this.expiryTime - (new Date() - this.cachedOn);
            };
        };

        // key is url itself - It will be used when same url is to be queried
        this.responseByUrl = {};

        this.enableCache = true;

        this.addObject = function (key, carrier, object, forced) {
            var existing = carrier[key];

            if (this.enableCache === false) {
                return;
            }

            if (existing === undefined || existing.isStale() === true || forced === true) {
                carrier[key] = this.getCacheableObject(object);
            }
        };

        this.getCacheableObject = function (object) {
            return new CachedObject(object);
        };

        this.cacheByUrl = function (url, response) {
            this.addObject(url, this.responseByUrl, response);
        };

        this.getCachedByUrl = function (url) {
            var response = this.responseByUrl[url];

            if (response !== undefined && response.isStale() === false) {
                return response;
            }

            return undefined;
        };

        this.deleteFromCache = function (url) {
            this.responseByUrl[url] = undefined;
        };

        this.deleteAllCachedCampaignListUrls = function () {
            var url;

            for (url in this.responseByUrl) {
                if (url.indexOf('/campaigns/bystate') > -1) {
                    this.deleteFromCache(url);
                }
            }
        };
    });
});
