
(function() {
    'use strict';

    angObj.controller('UsersAddOrEdit', function($scope, $modalInstance,accountsService,$timeout,$modal, $location,utils) {
        $scope.permissions = [];
        $scope.isSuperAdmin=true;
        $scope.clientName=[];
        $scope.advertiserName=[];
        $scope.brandName=[];
        $scope.User = {
            data: []
        }


        $scope.userConsoleFormDetails.role_template_id = accountsService.getRoleId('Super_Admin');


        $scope.User.delete_filter = function(event,index) {// the last one getting deleted always
            var elem = $(event.target);
//            elem.closest(".add-filters").remove();
            $scope.permissions.splice(index,1);
            $scope.User.data.splice(index,1);
            $scope.clientName.splice(index, 1);
            $scope.userModalData.splice(index,1);
            $scope.advertiserName.splice(index,1)


        };
        $scope.close=function(){
            $modalInstance.dismiss();
        };
        $scope.selectedRole=function(roleType){
            if(roleType=="Super_Admin"){
                $scope.isSuperAdmin=true;
                $scope.permissions = [];
            }
            else
                $scope.isSuperAdmin=false;
        };
        $scope.userModalData=[];

        $scope.saveUserForm=function(){
            $scope.$broadcast('show-errors-check-validity');
           // if ($scope.userCreateEditForm.$valid) {
                var formElem = $("#userCreateEditForm");
                var formData = formElem.serializeArray();
                formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
                if(formData.userLogin && formData.firstName && formData.lastName && formData.password){
                    console.log("formData",formData);
                   var postDataObj={};
                    postDataObj=$scope.userConsoleFormDetails;
                    postDataObj.permissions=$scope.User.data;
                    postDataObj.role_template_id = accountsService.getRoleId(postDataObj.role_template_id);
                }
            console.log("postDataObj==",JSON.stringify(postDataObj));
            $scope.resetFields();
           // console.log($scope.permissions);
           // console.log($scope.User.data);
        },
        $scope.selectedClientHandler=function(clientObj,index){

            var counter=accountsService.getCounter();
            $scope.selectedClient={};
            $scope.User.data[index].clientId = clientObj.id;
            $scope.clientName[index] = clientObj.name;

            //initialize advertiser,brand
            if(!$scope.userModalData[index]){
                $scope.userModalData[index] = [];
                $scope.userModalData[index]['Advertisers'] = [];
            }

            //populate advertiser based on selected client
            userModalPopup.getUserAdvertiser(clientObj.id,index);
//            $scope.selectedClient['counter']=$scope.allPermissions[index].name;
        }

        $scope.selectAdvertiser=function(advertiserObj,index){
            $scope.advertiserName[index] = advertiserObj.name;
            $scope.User.data[index].advertiserId = advertiserObj.id;
            console.log("advertiserObj == ",advertiserObj)
            //initialize brand
            if(!$scope.userModalData[index]){
                //$scope.userModalData[index] = [];
                $scope.userModalData[index]['Brands'] = [];
            }

            // load brands based on advertiser and client
            userModalPopup.getUserBrands($scope.User.data[index].clientId,advertiserObj.id,index)

        }

        $scope.selectBrand=function(brandObj,index){
            $scope.brandName[index] = brandObj.name;
            $scope.User.data[index].brandId = brandObj.id;
            console.log("brandObj == ",brandObj);

            //initialize permission
            if(!$scope.userModalData[index]){
                //$scope.userModalData[index] = [];
                $scope.userModalData[index]['Permissions'] = [];
            }
        }

        $scope.incrementCounter=function(index){
            accountsService.setCounter();
            $scope.permissions.push({uniqueId: accountsService.getCounter()});
        }

        var userModalPopup = {
            getUserClients:function(){
                 accountsService.getClients().then(function(res) {
                     console.log('client res=== ',res);
                     $scope.userModalData['Clients'] = res.data.data;
                 });
            },
            getUserBrands:function(clientId,advertiserId,index){
                accountsService.getAdvertisersBrand(clientId,advertiserId).then(function(res){
                    console.log('brand res=== ',res.data.data);
                    if(res.data.data)
                        $scope.userModalData[index]['Brands'] = res.data.data;

                });

                //$scope.userModalData['Brands']=[{id:0,name:"All Brands"},{id:22,name:"brand1"},{id:23,name:"brand2"},{id:24,name:"brand3"}]

            },
            getUserAdvertiser:function(clientId,index){
                accountsService.getClientsAdvertisers(clientId).then(function(res){
                    console.log('adv res=== ',res.data.data);
                    var counter = accountsService.getCounter();
                    if(res.data.data){
                        $scope.userModalData[index]['Advertisers'] = res.data.data;
                        //$scope.userModalData['Advertisers'][0] = {id:0,name:"All Advertisers"}
                    }
                })
                //$scope.userModalData['Advertisers']=[{id:0,name:"All Advertisers"},{id:32,name:"Advertiser1"},{id:33,name:"Advertiser2"},{id:34,name:"Advertiser3"}]
            },
            getUserPermission:function(){
                $scope.userModalData['Permission']=[{value:"ADMIN",name:"Admin"},{value:"WRITE",name:"Write"},{value:"READ",name:"Read"}]
            }

        }
        userModalPopup.getUserClients();
        //userModalPopup.getUserAdvertiser();
        //userModalPopup.getUserBrands();
        userModalPopup.getUserPermission();

        $scope.resetFields = function(){
            $scope.userConsoleFormDetails.email = '';
            $scope.userConsoleFormDetails.firstName = '';
            $scope.permissions = [];
            $scope.userConsoleFormDetails.lastName = '';
            $scope.userConsoleFormDetails.password = '';
            $scope.userConsoleFormDetails.role_template_id = ''
            $scope.close();

        }
    });

}());
