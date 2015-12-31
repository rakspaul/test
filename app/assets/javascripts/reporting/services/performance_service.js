(function () {
    "use strict";
    angObj.factory("performanceService", function (dataService,urlService) {
        return {
            getStrategyPerfData: function (param) {
                var url = urlService.APIVistoCustomQuery(param);
                return dataService.fetch(url);
            }
        };
    });
}());