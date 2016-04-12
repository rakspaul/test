define(['angularAMD','workflow/services/filter_service'],function (angularAMD) {
    angularAMD.directive('filterDirective',  function (filterService) {
        return {
            controller: function($scope,$rootScope, workflowService,loginModel,constants) {
                $scope.filterData = {};
                $scope.filterData.subAccountList = [];
                $scope.filterData.subAccSelectedName="";
                $scope.filterData.subAccSelectedId="";

                $scope.filterData.advertiserList = [{'id':'-1','name':'-- select Advertiser --'}];
                $scope.filterData.advertiserSelectedName="";
                $scope.filterData.advertiserSelectedId ="";

                var fetchAdvertiserAndBroadCast = function() {
                    filterService.fetchAdvertisers($scope.filterData.subAccSelectedId,function(advertiserData){
                        $scope.filterData.advertiserList= [{'id':'-1','name':'-- select Advertiser --'}].concat(advertiserData);
                        var args = {'from':$scope.from,'clientId':$scope.filterData.subAccSelectedId,'advertiserId':-1}
                        $rootScope.$broadcast('filterChanged',args);
                    });
                }

                var fetchSubAccounts = function(){
                    filterService.getSubAccount(function(accountData){
                        $scope.filterData.subAccountList = accountData;
                        $scope.filterData.subAccSelectedName = accountData[0].name;
                        $scope.filterData.subAccSelectedId = accountData[0].id;
                        $scope.filterData.advertiserSelectedName = $scope.filterData.advertiserList[0].name;
                        fetchAdvertiserAndBroadCast();
                    });
                }

                fetchSubAccounts();


                $scope.selectClient = function(subAccount) {
                    $("#subAcc_name_selected").text(subAccount.name);
                    $scope.filterData.subAccSelectedName = subAccount.name;
                    $scope.filterData.subAccSelectedId = subAccount.id;
                    fetchAdvertiserAndBroadCast();
                };

                $scope.selectAdvertisers = function(advertiser) {
                    $scope.filterData.advertiserSelectedName = advertiser.name;
                    $scope.filterData.advertiserSelectedId = advertiser.id;
                    var args = {'from':$scope.from,'clientId':$scope.filterData.subAccSelectedId,'advertiserId':advertiser.id}
                    $rootScope.$broadcast('filterChanged',args)
                };
            },
            restrict: 'EAC',
            scope : {from:'@'},
            templateUrl: assets.html_filter_drop_down,
            link: function($scope, element, attrs) {

            }
        };
    });

});
