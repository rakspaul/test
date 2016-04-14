define(['angularAMD','workflow/services/filter_service','common/services/constants_service'],function (angularAMD) {
    angularAMD.directive('filterDirective',  function (filterService) {
        return {
            controller: function($scope,$rootScope, workflowService,loginModel,constants) {
                $scope.filterData = {};
                $scope.filterData.subAccountList = [];
                $scope.filterData.subAccSelectedName="";
                $scope.filterData.subAccSelectedId="";
                $scope.constants = constants;

                $scope.filterData.advertiserList = [{'id':'-1','name':constants.ALL_ADVERTISERS}];
                $scope.filterData.advertiserSelectedName="";
                $scope.filterData.advertiserSelectedId ="";

                var fetchAdvertiserAndBroadCast = function(onClientSelect = false) {
                    filterService.fetchAdvertisers($scope.filterData.subAccSelectedId,function(advertiserData){
                        console.log('adfertisers,',$scope.filterData.subAccSelectedId,advertiserData);
                        $scope.filterData.advertiserList= [{'id':'-1','name':constants.ALL_ADVERTISERS}].concat(advertiserData);

                        if(onClientSelect) {
                            //set to localstorage
                            var adveriserObj = {'id':$scope.filterData.advertiserList[0].id,'name':$scope.filterData.advertiserList[0].name,'referedFrom':'filterDirective'};
                            localStorage.setItem('setAdvertiser', JSON.stringify(adveriserObj));

                            $scope.filterData.advertiserSelectedId  = $scope.filterData.advertiserList[0].id;
                            $scope.filterData.advertiserSelectedName = $scope.filterData.advertiserList[0].name;
                        }

                        var args = {'from':$scope.from,'clientId':$scope.filterData.subAccSelectedId,'advertiserId':-1}
                        $rootScope.$broadcast('filterChanged',args);
                    });
                }

                var fetchSubAccounts = function(){
                    filterService.getSubAccount(function(accountData){
                        $scope.filterData.subAccountList = accountData;
                        if(loginModel.getSelectedClient().id) {
                            $scope.filterData.subAccSelectedId = loginModel.getSelectedClient().id;
                            $scope.filterData.subAccSelectedName = loginModel.getSelectedClient().name;
                        } else {
                            $scope.filterData.subAccSelectedName = accountData[0].displayName;
                            $scope.filterData.subAccSelectedId = accountData[0].id;
                        }
                        var selectedAdvertiser = JSON.parse(localStorage.getItem('setAdvertiser'));
                        if(selectedAdvertiser){
                            $scope.filterData.advertiserSelectedId = selectedAdvertiser.id;
                            $scope.filterData.advertiserSelectedName = selectedAdvertiser.name;

                        } else {
                            $scope.filterData.advertiserSelectedId  = $scope.filterData.advertiserList[0].id;
                            $scope.filterData.advertiserSelectedName = $scope.filterData.advertiserList[0].name;
                        }

                        fetchAdvertiserAndBroadCast();
                    });
                }

                fetchSubAccounts();


                $scope.selectClient = function(subAccount) {
                    $("#subAcc_name_selected").text(subAccount.displayName);
                    $scope.filterData.subAccSelectedName = subAccount.displayName;
                    $scope.filterData.subAccSelectedId = subAccount.id;
                    loginModel.setSelectedClient({'id':subAccount.id,'name':subAccount.displayName});
                    fetchAdvertiserAndBroadCast(true);
                };

                $scope.selectAdvertisers = function(advertiser) {
                    $scope.filterData.advertiserSelectedName = advertiser.name;
                    $scope.filterData.advertiserSelectedId = advertiser.id;
                    var adveriserObj = {'id':advertiser.id,'name':advertiser.name,'referedFrom':'filterDirective'};

                    //set to localstorage
                    localStorage.setItem('setAdvertiser', JSON.stringify(adveriserObj));
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
