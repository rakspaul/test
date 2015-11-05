var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('AccountsController', function ($scope, $window, $routeParams, constants, accountsService, $timeout, utils, $location , $modal ) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#creative_nav_link').addClass('active');
        $scope.textConstants = constants;
        $scope.clientsDetails = [];
        $scope.advertiserName = '';
        $scope.mode = 'create';
        $scope.client = '';



        $scope.show_advertisers = function(event,clientId) {
            //$scope.fetchAllAdvertisers(clientId);
            var elem = $(event.target);
            elem.closest(".each-account-details").find(".advertiser-list").toggle() ;
            elem.closest(".each-account-details").find(".particular-account-box").toggleClass("open");
            $scope.fetchAllAdvertisers(clientId);
        };
        $scope.show_advertisers_resp_brands = function(event,client,advertiser) {
            var elem = $(event.target);
            elem.closest(".each-advertiser").find(".advertiser-resp-brands-list").toggle() ;
            $scope.fetchBrands(client,advertiser);
        };
        $scope.show_edit = function(type) {
            $(".edit-container").hide();
            $('#'+ type +'-edit-container').toggle('slide', { direction: "right" }, 500);
        };


        $scope.fetchAllClients = function(){
            accountsService.getClients().then(function(res) {
                $scope.clientsDetails = res.data.data;

                //for(var i = 0; i < $scope.clientsDetails.length; i++) {
                //    $scope.fetchAllAdvertisers($scope.clientsDetails[i].id);
                //}
            })
        }
        $scope.fetchAllClients();

        $scope.fetchAllAdvertisers = function(clientId){
               accountsService.getClientsAdvertisers(clientId).then(function(res){
                   var index = _.findIndex($scope.clientsDetails, function(item) {
                       return item.id == clientId});
                   $scope.clientsDetails[index]['advertisement'] = [];
                    $scope.clientsDetails[index]['advertisement'] = res.data.data;
               });
        }

        $scope.fetchBrands = function(clientId,advertiserId){
            accountsService.getAdvertisersBrand(clientId,advertiserId).then(function(res){
                var clientIndex = _.findIndex($scope.clientsDetails, function(item) {
                    return item.id == clientId});

                var advIndex = _.findIndex($scope.clientsDetails[clientIndex]['advertisement'], function(item) {
                    return item.id == advertiserId});

                $scope.clientsDetails[clientIndex]['advertisement'][advIndex]['brand'] = res.data.data;
                console.log($scope.clientsDetails)
            });
        }

        //Add or Edit Pop up for Advertiser
        $scope.AddOrEditAdvertiserModal = function(advObj,mode,client) {
            $scope.mode = mode;
            $scope.client = client;
            if(mode == 'edit'){
                accountsService.setToBeEditedAdvertiser(advObj);
                $scope.advertiserName = advObj.name;
            }
            var $modalInstance = $modal.open({
                templateUrl: assets.html_accounts_add_or_edit_advertiser,
                controller:"AccountsAddOrEditAdvertiser",
                scope:$scope,
                windowClass: 'edit-dialog',
                resolve: {
                    //accountsService.setToBeEditedAdvertiser(advObj);

                    // report: function () {
                    //     return $scope.reportList[index];
                    // },
                    // reportIndex: function() {
                    //     return index;
                    // },
                    // reportList: function() {
                    //     return $scope.reportList;
                    // }
                }
            });
        }

        //Add or Edit Pop up for Brand
        $scope.AddOrEditBrandModal = function() {
            var $modalInstance = $modal.open({
                templateUrl: assets.html_accounts_add_or_edit_brand,
                controller:"AccountsAddOrEditBrand",
                scope:$scope,
                windowClass: 'edit-dialog',
                resolve: {
                    // report: function () {
                    //     return $scope.reportList[index];
                    // },
                    // reportIndex: function() {
                    //     return index;
                    // },
                    // reportList: function() {
                    //     return $scope.reportList;
                    // }
                }
            });
        }

    });

})();

