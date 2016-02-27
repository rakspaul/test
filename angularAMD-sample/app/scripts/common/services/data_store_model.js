define(['angularAMD','common/utils'], function (angularAMD) {
  angularAMD.service("dataStore", function (utils) {
  "use strict";

  var CachedObject = function (val) {
    this.cachedOn = new Date();
    this.value = val;
    this.expiryTime = 30*60*1000 // 30 mins in milliseconds
    this.isStale = function () {
      var dataAge = new Date() - this.cachedOn
      if(dataAge > this.expiryTime) return true;
      return false;
    }
    //get time until this data object's expiry in milliseconds
    this.getRemainingTime = function () {
      return this.expiryTime - (new Date() - this.cachedOn);
    }
  }
  var DataStore = function (utils) {
    this.responseByUrl = {} // key is url itself - It will be used when same url is to be queried
    this.enableCache = true;
    this.addObject = function (key, carrier, object, forced) {
      if(this.enableCache === false) {
        return;
      }
      var existing = carrier[key];
      if(existing == undefined || existing.isStale() === true || forced === true) {
        carrier[key] = this.getCacheableObject(object)
      }
    };
    this.getCacheableObject = function (object) {
      return new CachedObject(object)
    };
    this.cacheByUrl = function(url, response) {
      this.addObject(url, this.responseByUrl, response)
    };
    this.getCachedByUrl = function (url) {
      var response = this.responseByUrl[url]
      if(response != undefined && response.isStale() === false) {
       // console.log('found saved response for url ' + url + ' Expiry Time: ' + utils.roundOff(response.getRemainingTime()/1000/60, 2) + "mins")
        return response;
      }
      return undefined
    };
    this.deleteFromCache = function (url) {
     // console.log('force delete from cache for url: ' + url);
      this.responseByUrl[url] = undefined
    };

    this.deleteAllCachedCampaignListUrls = function () {
      for (var url in this.responseByUrl) {
        if(url.indexOf('/campaigns/bystate') > -1) {
          this.deleteFromCache(url);
        }
      }
    };
  }
});
});