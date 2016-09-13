define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.factory('requestCanceller', ['$q','$timeout', function ($q,$timeout) {
        var cancellersById = {},

            initCanceller = function (id) {
                cancelLastRequest(id);
                cancellersById[id] = $q.defer();

                return cancellersById[id];
            },

            cancelLastRequest = function (id) {
                var canceller = cancellersById[id];

                if (canceller !== undefined) {
                    $timeout(function () {
                        canceller.resolve('user cancelled');
                    },8000);
                }
            },

            resetCanceller = function (id) {
                cancellersById[id] = undefined;
            },

            requestCanceller = function () {
                return {
                    initCanceller: initCanceller,
                    cancelLastRequest: cancelLastRequest,
                    resetCanceller: resetCanceller
                };
            };

        return requestCanceller();
    }]);
});
