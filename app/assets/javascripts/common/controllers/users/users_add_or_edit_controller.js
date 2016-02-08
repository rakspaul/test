
(function() {
    'use strict';

    angObj.controller('UsersAddOrEdit', function($scope, $modalInstance,accountsService,$timeout,$modal, $location,$rootScope,constants) {
        $scope.permissions = [];
        $scope.isSuperAdmin=true;
        $scope.clientName=[];
        $scope.advertiserName=[];
        $scope.brandName=[];
        $scope.User = {
            data: []
        };
        $scope.Usernew = {
            data: []
        };
        $scope.userModalData=[];

        $scope.editmode = false;
        var defaultAccess = 'ADMIN';
        var editedUserDetails = {};
        $scope.userConsoleFormDetails.roleTemplateId = constants.account_admin;

        $scope.delete_filter = function(event,index) {// the last one getting deleted always
            var elem = $(event.target);
//            elem.closest(".add-filters").remove();
            $scope.permissions.splice(index,1);
            $scope.User.data.splice(index,1);
            $scope.clientName.splice(index, 1);
            $scope.userModalData.splice(index,1);
            $scope.advertiserName.splice(index,1);
            $scope.brandName.splice(index,1)


        };
        $scope.close=function(){
            $modalInstance.dismiss();
        };
        $scope.selectedRole=function(roleType){
            if(roleType == constants.super_admin){
                $scope.isSuperAdmin=true;
                $scope.permissions = [];
            }
            else
                $scope.isSuperAdmin=false;

        };

        $scope.saveUserForm=function(){
            $scope.$broadcast('show-errors-check-validity');
           // if ($scope.userCreateEditForm.$valid) {
                var formElem = $("#userCreateEditForm");
                var formData = formElem.serializeArray();
                formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
                if($scope.editmode)
                    formData.password = '123456';

                if(formData.userLogin && formData.firstName && formData.lastName && formData.password){
                   var postDataObj={};
                    postDataObj=$scope.userConsoleFormDetails;
                    if($scope.editmode)
                        postDataObj.password = '123456';

                    postDataObj.permissions=$scope.User.data;
                    var deletableIndex = [];
                    _.each(postDataObj.permissions,function(item,index){
                        if(item){
                            if(!item.advertiserId || item.advertiserId == "")
                                item.advertiserId = -1;
                            if(!item.brandId || item.brandId == "")
                                item.brandId = -1;
                            if(!item.clientId || item.clientId == "")
                                item.clientId = -1;
                            if(!item.orgId   || item.orgId == "")
                                item.orgId = -1;
                            if(item.resellerId !=0 && (item.resellerId == undefined || item.resellerId == ""))
                                item.resellerId = -1;

                            if(item.advertiserId == -1 && item.brandId == -1 && item.clientId == -1 && item.orgId == -1 && item.resellerId == -1)
                                deletableIndex.push(index)
                        }
                    })

                    _.each(deletableIndex,function(delIndex){
                        postDataObj.permissions.splice(delIndex,1);
                    });

                    postDataObj.email=postDataObj.email.toLowerCase();
                    //postDataObj.role_template_id = accountsService.getRoleId(postDataObj.role_template_id);

                    //create user call goes here
                    if((constants.super_admin != postDataObj.roleTemplateId && postDataObj.permissions.length > 0) || constants.super_admin == postDataObj.roleTemplateId ){
                        if($scope.editmode)
                            $scope.updateUser(postDataObj);
                        else
                            $scope.createUser(postDataObj);
                    }
                    else{
                        $rootScope.setErrAlertMessage(constants.WF_PERMISSION_NEEDED);
                    }
                    //$scope.resetFields
                }


           // console.log($scope.permissions);
           // console.log($scope.User.data);
        };
        $scope.updateUser = function(postDataObj){

            accountsService.updateUser(postDataObj,editedUserDetails).then(function(res){
                if (res.status === "OK" || res.status === "success") {
                    $rootScope.$broadcast('refreshUserList');
                    $scope.resetFields();
                    $rootScope.setErrAlertMessage(constants.WF_USER_EDIT_SUCCESS, 0);
                }
                else{
                    $rootScope.setErrAlertMessage(constants.WF_USER_EDIT_FAIL);
                }
            },function(err){
                $rootScope.setErrAlertMessage(constants.WF_USER_EDIT_FAIL);
            });

        };

        $scope.createUser = function(postDataObj){
            accountsService.createUser(postDataObj).then(function(res){
                if (res.status === "OK" || res.status === "success") {
                    $rootScope.$broadcast('refreshUserList');
                    $scope.resetFields();
                    $rootScope.setErrAlertMessage(constants.WF_USER_CREATION_SUCCESS, 0);
                }
                else{
                    $rootScope.setErrAlertMessage(constants.WF_USER_CREATION_FAIL);
                }
            },function(err){
                $rootScope.setErrAlertMessage(constants.WF_USER_CREATION_FAIL);
            });
        };

        $scope.selectedClientHandler=function(clientObj,index, orgId, resellerId,editData){

            var counter=accountsService.getCounter();
            if(!$scope.User.data[index]){
                $scope.User.data[index] = {};
                $scope.User.data[index].accessLevel = "ADMIN";
            }

            $scope.selectedClient={};
            if(clientObj.clientType === "ORGANIZATION") {
                $scope.User.data[index].orgId = clientObj.id;
                $scope.User.data[index].resellerId = -1;
                $scope.User.data[index].clientId = -1;
            } else if(clientObj.clientType === "RESELLER") {
                $scope.User.data[index].resellerId = clientObj.id;
                $scope.User.data[index].orgId = orgId;
                $scope.User.data[index].clientId = -1;
            } else {
                $scope.User.data[index].orgId = orgId;
                if(resellerId) {
                    $scope.User.data[index].resellerId = resellerId;
                } else {
                    $scope.User.data[index].resellerId = 0;
                }
                $scope.User.data[index].clientId = clientObj.id;
            }

            $scope.clientName[index] = clientObj.name;

            //initialize advertiser,brand
            if(!$scope.userModalData[index]){
                $scope.userModalData[index] = [];
                $scope.userModalData[index]['Advertisers'] = [];
            }

            //hard reset advertiser and brand and permission before populating
            $scope.advertiserName[index] = "Select Advertiser";
            $scope.User.data[index].advertiserId = '-1';
            $scope.userModalData[index].Advertisers = [];
            $scope.brandName[index] = "Select Brand";
            $scope.User.data[index].brandId = '-1';
            $scope.userModalData[index].Brands = [];

            //populate advertiser based on selected client
            if(editData)
                userModalPopup.getUserAdvertiser(clientObj,index,true,editData);
            else
                userModalPopup.getUserAdvertiser(clientObj,index);

//            $scope.selectedClient['counter']=$scope.allPermissions[index].name;
        };

        $scope.selectAdvertiser=function(advertiserObj,index,editmode,editData){
            $scope.advertiserName[index] = advertiserObj.name;
            $scope.User.data[index].advertiserId = advertiserObj.id;
            //initialize brand
            if(!$scope.userModalData[index]){
                //$scope.userModalData[index] = [];
                $scope.userModalData[index]['Brands'] = [];
            }

            //hard reset advertiser and brand and permission before populating
            $scope.brandName[index] = "Select Brand";
            $scope.User.data[index].brandId = "";
            $scope.userModalData[index].Brands = [];

            //if in any case the client id is undefined set it from edit data
            if(!$scope.User.data[index].clientId)
                $scope.User.data[index].clientId = editData.clientId;

            // load brands based on advertiser and client
            if(editmode)
                userModalPopup.getUserBrands($scope.User.data[index].clientId,advertiserObj.id,index,editmode,editData);
            else
                userModalPopup.getUserBrands($scope.User.data[index].clientId,advertiserObj.id,index);


        };

        $scope.selectBrand=function(brandObj,index){
            $scope.brandName[index] = brandObj.name;
            $scope.User.data[index].brandId = brandObj.id;

            //initialize permission
            if(!$scope.userModalData[index]){
                //$scope.userModalData[index] = [];
                $scope.userModalData[index]['Permissions'] = [];
            }
        };

        $scope.incrementCounter=function(index){
            accountsService.setCounter();
            if(!$scope.User.data[accountsService.getCounter()-1])
                $scope.User.data[accountsService.getCounter()-1] = {};

            $scope.User.data[accountsService.getCounter()-1]["accessLevel"] = defaultAccess;
            $scope.permissions.push({});
            //console.log("$scope.User.data=",$scope.User.data);
        };

        $scope.setPermissionAccess = function(index,val){
            $scope.User.data[index].accessLevel = val;
        }


        var userModalPopup = {
            getUserClients:function(editmode,user){
                 accountsService.getClients(function(res) {
                     $scope.userModalData['Clients'] = res.data.data;
                     if(editmode)
                         setPreselectedPermission(user);
                 },function(){

                 },'cancellable');
            },
            getUserBrands:function(clientId,advertiserId,index,editmode,editData){
                accountsService.getAdvertisersBrand(clientId,advertiserId).then(function(res){
                    if(res.data.data)
                        $scope.userModalData[index]['Brands'] = res.data.data;

                    if(editmode){
                        var brandIndex = _.findIndex($scope.userModalData[index]['Brands'], function(item) {
                            return item.id == editData.brandId});

                        if(brandIndex != -1){
                            $scope.selectBrand($scope.userModalData[index]['Brands'][brandIndex],index,editmode,editData);
                        }
                    }
                });

                //$scope.userModalData['Brands']=[{id:0,name:"All Brands"},{id:22,name:"brand1"},{id:23,name:"brand2"},{id:24,name:"brand3"}]

            },
            getUserAdvertiser:function(clientObj,index,editmode,editData){
                accountsService.getClientsAdvertisers(clientObj.id).then(function(res){
                    var counter = accountsService.getCounter();
                    if(res.data.data){
                        $scope.userModalData[index]['Advertisers'] = res.data.data;

                        if(editmode){
                            var advertiserIndex = _.findIndex($scope.userModalData[index]['Advertisers'], function(item) {
                                return item.id == editData.advertiserId});

                            if(advertiserIndex != -1){
                                $scope.selectAdvertiser($scope.userModalData[index]['Advertisers'][advertiserIndex],index,editmode,editData);
                            }

                        }
                        //$scope.userModalData['Advertisers'][0] = {id:0,name:"All Advertisers"}
                    }
                });
                //$scope.userModalData['Advertisers']=[{id:0,name:"All Advertisers"},{id:32,name:"Advertiser1"},{id:33,name:"Advertiser2"},{id:34,name:"Advertiser3"}]
            },
            getUserPermission:function(){
                $scope.userModalData['Permission']=[{value:"ADMIN",name:"Admin"},{value:"WRITE",name:"Write"},{value:"READ",name:"Read"}];
            }


        };
        $scope.resetFields = function(isInitialEdit){
            $scope.userConsoleFormDetails.id = undefined;
            $scope.userConsoleFormDetails.email = undefined;
            $scope.userConsoleFormDetails.firstName = undefined;
            $scope.permissions = [];
            $scope.userConsoleFormDetails.lastName = undefined;
            $scope.userConsoleFormDetails.password = undefined;
            $scope.userConsoleFormDetails.roleTemplateId = undefined;
            $scope.userConsoleFormDetails.isEditPassword = undefined;
            $scope.userConsoleFormDetails.updatedAt = undefined;
            $scope.clientName=[];
            $scope.userModalData = [];
            $scope.advertiserName=[];
            $scope.brandName=[];
            $scope.User = {
                data: []
            };
            $scope.isSuperAdmin = false;
            accountsService.initCounter();
            editedUserDetails = {};
            if(!isInitialEdit)
                $scope.close();

        };

        $scope.resetFields();
        if(!$scope.editmode)
            userModalPopup.getUserClients();
        //else{console.log("reset")

        //}
        //userModalPopup.getUserAdvertiser();
        //userModalPopup.getUserBrands();
        userModalPopup.getUserPermission();


        //set permissions in edit mode
        $rootScope.$on('permissionsForUsers',function(e,user){
            $scope.resetFields(true);
            userModalPopup.getUserClients(true,user);
            userModalPopup.getUserPermission();
            $scope.editmode = true;
        })

        function setPreselectedPermission(user){

            accountsService.getUsersDetails(user[0].id).then(function(res){
                $scope.User = {
                    data: []
                };
                var data = res.data.data;
                editedUserDetails = data;
                $scope.userConsoleFormDetails.email = data.email;
                $scope.userConsoleFormDetails.firstName = data.firstName;
                $scope.userConsoleFormDetails.lastName = data.lastName;
                $scope.userConsoleFormDetails.roleTemplateId = data.roleTemplateId;

                $scope.userConsoleFormDetails.isEditPassword = data.isCaasEnabled;
                if(data.isCaasEnabled) {
                    $scope.userConsoleFormDetails.password = "123456";
                } else {
                    $scope.userConsoleFormDetails.password = "";
                }

                if(data.roleTemplateId != constants.super_admin){
                    $scope.isSuperAdmin = false;
                    for(var i = 0; i < data.permissions.length; i++){
                        $scope.incrementCounter();
                        var clientObj = getClientObject(data.permissions[i].clientId,data.permissions[i].orgId,data.permissions[i].resellerId);
                      //  console.log('clientObj id',clientObj.id);
                        //console.log(" data.permissions[i].orgId", data.permissions[i].orgId," data.permissions[i].resellerId", data.permissions[i]);
                        $scope.selectedClientHandler(clientObj,i,  data.permissions[i].orgId,data.permissions[i].resellerId,data.permissions[i]);
                        $scope.User.data[i].accessLevel = data.permissions[i].accessLevel;
                    }
                }
                else{
                    $scope.isSuperAdmin = true;
                }

            })
        }

        //get client object based on id
        function getClientObject(clientId,orgId,resellerId){
                var finalClientObj;
                //var flattenedClient = _.flatten($scope.userModalData['Clients'])
                //console.log("flattentd cleint",flattenedClient);
             //   console.log("orgId = ",orgId,"resellerId = ",resellerId,"clientId = ",clientId);

                var orgIndex = _.findIndex($scope.userModalData['Clients'], function(item) {
                return item.id == orgId});

                if(orgIndex != -1){
                    if(resellerId == -1 && clientId == -1){
                        finalClientObj =  $scope.userModalData['Clients'][orgIndex];
                    }  else if(resellerId == 0 && clientId > 0){
                        var clientIndex = _.findIndex($scope.userModalData['Clients'][orgIndex]['children'] , function(item) {
                            return item.id == clientId});
                        finalClientObj = $scope.userModalData['Clients'][orgIndex]['children'][clientIndex];
                    }  else if(resellerId > 0 && clientId > 0){
                        var resellerIndex = _.findIndex($scope.userModalData['Clients'][orgIndex]['children'], function(item) {
                            return item.id == resellerId});
                        var clientIndex = _.findIndex($scope.userModalData['Clients'][orgIndex]['children'][resellerIndex]['children'], function(item) {
                            return item.id == resellerId});
                        finalClientObj = $scope.userModalData['Clients'][orgIndex]['children'][resellerIndex]['children'][clientIndex];
                    } else if(resellerId > 0 && clientId < 0){
                        var resellerIndex = _.findIndex($scope.userModalData['Clients'][orgIndex]['children'], function(item) {
                            return item.id == resellerId});
                        finalClientObj = $scope.userModalData['Clients'][orgIndex]['children'][resellerIndex];
                    }

                }

               // console.log("finalClientObj =",finalClientObj);
            return finalClientObj;
                //if(orgIndex != -1){
                //    //first level client
                //    if($scope.userModalData['Clients'][orgIndex].id != clientId){
                //        var children = $scope.userModalData['Clients'][orgIndex]['children'];
                //        var resellerIndex = _.findIndex(children, function(item) {
                //            return item.id == resellerId});
                //
                //        //second level client
                //        if(resellerId != 0 && clientId == -1){ // only reseller and there is no child for reseller
                //            return children[resellerIndex];
                //        }
                //        else if(resellerId == 0 && clientId != -1){ // there is no third level
                //            var clientIndex = _.findIndex(children, function(item) {
                //                return item.id == clientId});
                //            return children[clientIndex];
                //        }
                //        else if(resellerId != 0 && clientId != -1){
                //            //third level client
                //            var clientIndex = _.findIndex(children[resellerIndex], function(item) {
                //                return item.id == clientId});
                //            return children[resellerIndex][clientIndex];
                //        }
                //
                //    }
                //    else{
                //        return $scope.userModalData['Clients'][orgIndex];
                //    }
                //}



        }

        $rootScope.$on('resetUserModal',function(){
            $scope.resetFields(true);
        })

    });



}());
