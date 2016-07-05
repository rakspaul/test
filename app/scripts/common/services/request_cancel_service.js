define(['angularAMD'], function(angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.factory('requestCanceller', ['$q', function ($q) {
        var cancellersById = {},

            initCanceller = function(id) {
                cancelLastRequest(id);
                cancellersById[id] = $q.defer();
                return cancellersById[id];
            },

            cancelLastRequest = function (id) {
                var canceller = cancellersById[id];

                if (canceller !== undefined) {
                    canceller.resolve('user cancelled');
                }
            },

            resetCanceller = function(id) {
                cancellersById[id] = undefined;
            },

            requestCanceller = function() {
                return {
                    initCanceller: initCanceller,
                    cancelLastRequest: cancelLastRequest,
                    resetCanceller: resetCanceller
                };
            };

        return requestCanceller();
    }]);
});