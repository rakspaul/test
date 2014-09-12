/*global angObj*/
(function () {
    'use strict';
    angObj.controller('campaignController', function ($scope, dataService, campaign,  $routeParams, $cookies, $timeout, $http, common) {

        

    /**
     *init :  Called when onload of the page (Initial function)
     * Params : 
     * agencyId  :  Agency Id, got from the $routeParams.agencyId;
     * advId :   Advertiser Id, got from the $routeParams.advertiserId;
     * */
        $scope.init = function (timePeriod) {

                dataService.getCampaignActiveInactive(timePeriod).then(function (result) {

                    if(common.useTempData){
                    //for local data
                        //console.log(result);
                        $scope.marketerName = result.data.marketer_name;
                        if (result.data.orders.length > 0) {
                            $scope.campaignList = campaign.setActiveInactiveCampaigns(result.data.orders, timePeriod);
                        }

                    }else{
                            //console.log(result.data.orders);
                        $scope.marketerName = result.data.marketer_name;
                        if (result.data.orders.length > 0) {
                            $scope.campaignList = campaign.setActiveInactiveCampaigns(result.data.orders, timePeriod);
                        }
                    }//end of check
                });

        };



       

        $scope.isLoading = function () {
            return $http.pendingRequests.length > 0;
        };
        $scope.$watch($scope.isLoading, function (v) {
            if (v) {
                jQuery('.loading-spiner-holder').show();
                jQuery('#ngViewPlaceHolder').hide();
            } else {
                jQuery('.loading-spiner-holder').hide();
                jQuery('#ngViewPlaceHolder').show();
            }
        });
    });


}());