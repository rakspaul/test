define(['angularAMD'], function (angularAMD) {
  'use strict';
  angularAMD.factory("requestCanceller", ['$q', function ($q) {

    var cancellersById = {}
    var $q;
    var initCanceller = function (id) {
      cancelLastRequest(id);
      cancellersById[id] = $q.defer();
      return cancellersById[id];
    }

    var cancelLastRequest = function (id) {
      var canceller = cancellersById[id];
      if (canceller != undefined) {
        canceller.resolve('user cancelled');
      }
    }
    var resetCanceller = function (id) {
      cancellersById[id] = undefined;
    }
    var requestCanceller = function () {
      return {
        initCanceller: initCanceller,
        cancelLastRequest: cancelLastRequest,
        resetCanceller: resetCanceller
      };
    };

    return requestCanceller()
  }]);
});
