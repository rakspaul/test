/*global angObj, angular*/
(function () {
    "use strict";
    angObj.factory("domainReports", ["inventoryService", "dataTransferService", function (inventoryService,  datatransferservice) {

        return {
            getCampaignListForUser : function() {

                if(datatransferservice.getCampaignList()){
                    return datatransferservice.getCampaignList();
                }else {
                    return inventoryService.getCampaingsForUser();
                }
            }
        };
    }]);
}());