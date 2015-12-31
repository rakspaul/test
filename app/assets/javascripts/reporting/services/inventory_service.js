(function () {
    "use strict";
    angObj.factory("inventoryService", function (dataService,urlService) {
        return {
            getStrategyDomainData: function (param) {
                var url = urlService.APIVistoCustomQuery(param);
                return dataService.fetch(url);
            }
        };
    });
}());