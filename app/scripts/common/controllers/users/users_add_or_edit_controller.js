
define(['angularAMD', 'common/services/constants_service', 'workflow/services/account_service','common/moment_utils',
    'common/moment_utils',
    'workflow/directives/ng_update_hidden_dropdown'],function (angularAMD) {
    'use strict';

    angularAMD.controller('UsersAddOrEdit', function($scope, $rootScope, $compile,
                                                     constants,accountsService,momentService,
                                                     utils) {
        var _customctrl = this;
        _customctrl.editId = null;
        $scope.count = 0;
        $scope.permissions = [];
        $scope.pagePermissionValue = {};
        $scope.dropdownList = []
        $scope.isSuperAdmin = true;
        $scope.clientName = [];
        $scope.advertiserName = [];
        $scope.brandName = [];
        $scope.User = {
            data: []
        };
        $scope.Usernew = {
            data: []
        };
        $scope.userModalData = [];

        $scope.editmode = false;
        var defaultAccess = 'ADMIN';
        var editedUserDetails = {};
        $scope.userConsoleFormDetails.roleTemplateId = constants.account_admin;


        $scope.close = function () {
            //$modalInstance.dismiss();
        };
        $scope.selectedRole = function (roleType) {
            if (roleType == constants.super_admin) {
                $scope.isSuperAdmin = true;
                $scope.permissions = [];
            }
            else
                $scope.isSuperAdmin = false;

        };
        _customctrl.validateInputs = function () {

            var icheck = ["email", "firstName", "lastName", "password"],
                len = icheck.length,
                retVal = true;
            for(var i=0; i<len; i++){
                console.log("icheck[i]..."+icheck[i]+"......."+$scope.userConsoleFormDetails[icheck[i]]+"...."+_customctrl.validateVal($scope.userConsoleFormDetails[icheck[i]]))
                if(!_customctrl.validateVal($scope.userConsoleFormDetails[icheck[i]])){
                    $rootScope.setErrAlertMessage("Please enter a valid user credentials");
                    return false;
                }
            }
           // _.each(icheck, function(item){

           // });
            return retVal;
        }
        _customctrl.createData = function(){
          //  var a = moment().format("MM/DD/YYYY");
            var timeNow = momentService.newMoment(moment().format("MM/DD/YYYY")).format('YYYY-MM-DD HH-MM-SS.SSS');
            console.log("timeNow...."+timeNow+"......"+(new Date()));
            console.log($scope);
            _customctrl.requestData = {
         //       "id": _customctrl.editId,
                "firstName": $scope.userConsoleFormDetails.firstName,
                "lastName": $scope.userConsoleFormDetails.lastName,
                "email": $scope.userConsoleFormDetails.email,
                "password": $scope.userConsoleFormDetails.password,
               // "roleTemplateId": ($scope.isCurr_SuperUser ? 1 : 2),
                "status": true,
         //       "createdBy": null,
         //       "updatedBy": null,
         //       "createdAt": (_customctrl.editId ? _customctrl.responseData.createdAt : timeNow),
         //       "updatedAt": (_customctrl.editId ? timeNow : null),
                "permissions": []
            }
            _customctrl.requestData.roleTemplateId = ($scope.isCurr_SuperUser ? 1 : 2);
            if(_customctrl.editId){
                _customctrl.requestData.id = _customctrl.editId;
               // _customctrl.requestData.id =
            }
            console.log("_customctrl.requestData.roleTemplateId...."+_customctrl.requestData.roleTemplateId+"......"+$scope.isCurr_SuperUser);
            _.each($scope.permissions, function(item, i){
                _customctrl.requestData.permissions.push({
                    "clientId" : $scope.permissions[i].clientId,
                    "application": "visto",
                    "features": $scope.pagePermissionValue[i]["code"].split(","),
                    "resources": []
                });
                if($scope.pagePermissionValue[i]["code"] == "ENABLE_ALL"){
                    _customctrl.requestData.permissions[i].resources.push({
                        "accessLevel": "admin",
                        "advertiserId": -1,
                        "brandId": -1
                    });
                }else{
                    _.each(item.resources, function(d, j){
                        _customctrl.requestData.permissions[i].resources.push({
                            "accessLevel": d.permissionValue,
                            "advertiserId": d.advertiserId,
                            "brandId": d.brandId
                        });
                    });
                }
            });
            return _customctrl.requestData;
        }

        $scope.saveUserForm=function(){
              console.log("Data",_customctrl.createData());
//            $scope.$broadcast('show-errors-check-validity');
//           // if ($scope.userCreateEditForm.$valid) {
//                var formElem = $("#userCreateEditForm");
//                var formData = formElem.serializeArray();
//                formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
//                if($scope.editmode)
//                    formData.password = '123456';
//
//                if(formData.userLogin && formData.firstName && formData.lastName && formData.password){
//                   var postDataObj={};
//                    postDataObj=$scope.userConsoleFormDetails;
//                    if($scope.editmode)
//                        postDataObj.password = '123456';
//
//                    postDataObj.permissions=$scope.User.data;
//                    var deletableIndex = [];
//                    _.each(postDataObj.permissions,function(item,index){
//                        if(item){
//                            if(!item.advertiserId || item.advertiserId == "")
//                                item.advertiserId = -1;
//                            if(!item.brandId || item.brandId == "")
//                                item.brandId = -1;
//                            if(!item.clientId || item.clientId == "")
//                                item.clientId = -1;
//                            if(!item.orgId   || item.orgId == "")
//                                item.orgId = -1;
//                            if(item.resellerId !=0 && (item.resellerId == undefined || item.resellerId == ""))
//                                item.resellerId = -1;
//
//                            if(item.advertiserId == -1 && item.brandId == -1 && item.clientId == -1 && item.orgId == -1 && item.resellerId == -1)
//                                deletableIndex.push(index)
//                        }
//                    })
//
//                    _.each(deletableIndex,function(delIndex){
//                        postDataObj.permissions.splice(delIndex,1);
//                    });
//
//                    postDataObj.email=postDataObj.email.toLowerCase();
//                    //postDataObj.role_template_id = accountsService.getRoleId(postDataObj.role_template_id);
//
//                    //create user call goes here
//                    if((constants.super_admin != postDataObj.roleTemplateId && postDataObj.permissions.length > 0) || constants.super_admin == postDataObj.roleTemplateId ){
//                        if($scope.editmode)
//                            $scope.updateUser(postDataObj);
//                        else
//                            $scope.createUser(postDataObj);
//                    }
//                    else{
//                        $rootScope.setErrAlertMessage(constants.WF_PERMISSION_NEEDED);
//                    }
//                    //$scope.resetFields
//                }


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
        _customctrl.validateVal = function(val){
            return (typeof val == "undefined" || val.trim() == "") ? false : true;
        }
        _customctrl.filterRequestData = function(){
            var request = _customctrl.createData();
            for(var k in request){
                if(request[k] == null){
                    delete request[k];
                }
            }
            return request;
        }
        $scope.saveUserForm = function( ){
         //   console.log(_customctrl.createData());
//            if(!_customctrl.validateInputs()){
//                return;
//            }
            accountsService.createUser(_customctrl.filterRequestData()).then(function(res){
//                $('.user-list, .users-creation-page .heading').fadeIn();
//                $('.edit-dialog').fadeOut();
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
                $scope.userModalData[index] = {};
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

        $scope.selectAdvertiser=function(advertiserObj,accountIndex, permissionIndex,editmode,editData){
            $scope.permissions[accountIndex].resources[permissionIndex]["advertiserName"] = advertiserObj.name;
            $scope.permissions[accountIndex].resources[permissionIndex]["advertiserId"] = advertiserObj.id;
           // console.log("$scope.permissions[accountIndex].cliendId...."+$scope.permissions[accountIndex].clientId);
           // console.log("accountIndex...."+accountIndex+".......permissionIndex....."+permissionIndex);
            userModalPopup.getUserBrands($scope.permissions[accountIndex].clientId, advertiserObj.id, accountIndex, permissionIndex);
//            if(!$scope.advertiserName[accountIndex]){
//                $scope.advertiserName[accountIndex] = [];
//                $scope.advertiserName[accountIndex].push({"advertiserName":advertiserObj.name,"advertiserId":advertiserObj.id});
//                //if($scope.advertiserName[index])
//            }else{
//                $scope.advertiserName[accountIndex][permissionIndex] = {"advertiserName":advertiserObj.name,"advertiserId":advertiserObj.id};
//            }
//            $scope.advertiserName[index] = advertiserObj.name;
//            $scope.User.data[index].advertiserId = advertiserObj.id;
            //initialize brand
//            if(!$scope.userModalData[index]){
//                //$scope.userModalData[index] = [];
//                $scope.userModalData[index]['Brands'] = [];
//            }

            //hard reset advertiser and brand and permission before populating
//            $scope.brandName[index] = "Select Brand";
//            $scope.User.data[index].brandId = "";
//            $scope.userModalData[index].Brands = [];

            //if in any case the client id is undefined set it from edit data
//            if(!$scope.User.data[index].clientId)
//                $scope.User.data[index].clientId = editData.clientId;

            // load brands based on advertiser and client
//            if(editmode)
//                userModalPopup.getUserBrands($scope.User.data[index].clientId,advertiserObj.id,index,editmode,editData);
//            else {
//                //userModalPopup.getUserBrands($scope.User.data[index].clientId,advertiserObj.id,index);
//                userModalPopup.getUserBrands(2,4,index);
//            }


        };

        $scope.selectBrand=function(brandObj, accountIndex, permissionIndex){
            $scope.permissions[accountIndex].resources[permissionIndex]["brandName"] = brandObj.name;
            $scope.permissions[accountIndex].resources[permissionIndex]["brandId"] = brandObj.id;
//            $scope.brandName[index] = brandObj.name;
//            $scope.User.data[index].brandId = brandObj.id;
//
//            //initialize permission
//            if(!$scope.userModalData[index]){
//                //$scope.userModalData[index] = [];
//                $scope.userModalData[index]['Permissions'] = [];
//            }
        };
        $scope.selectPermission=function(permissionObj, accountIndex, permissionIndex){
            $scope.permissions[accountIndex].resources[permissionIndex]["permissionName"] = permissionObj.name;
            $scope.permissions[accountIndex].resources[permissionIndex]["permissionValue"] = permissionObj.value;
//            $scope.brandName[index] = brandObj.name;
//            $scope.User.data[index].brandId = brandObj.id;
//
//            //initialize permission
//            if(!$scope.userModalData[index]){
//                //$scope.userModalData[index] = [];
//                $scope.userModalData[index]['Permissions'] = [];
//            }
        };
        accountsService.initCounter();
        $scope.incrementCounter=function(index){
            _customctrl.accountIndex = accountsService.getCounter()
            $scope.pagePermissionValue[_customctrl.accountIndex] = {desc: "Enable Access to all features", code: "ENABLE_ALL"}
            accountsService.setCounter();
            if(!$scope.User.data[accountsService.getCounter()-1])
                $scope.User.data[accountsService.getCounter()-1] = {};

            $scope.User.data[accountsService.getCounter()-1]["accessLevel"] = defaultAccess;
            $scope.permissions.push({resources:[],clientName:"Select Account"});
            $scope.dropdownList.push({"clients":[], "pages":[]});

        };

        $scope.setPermissionAccess = function(index,val){
            $scope.User.data[index].accessLevel = val;
        }


        var userModalPopup = {
            getUserClients:function(editmode){
                 accountsService.getClients(function(res) {
                     $scope.userModalData['Clients'] = res.data.data;
                     console.log($scope.userModalData['Clients']);
//                     if(editmode) {
//                         _.each(permissions, function (item, i) {
//                             if (!permissions[i].clientName && permissions[i].clientId) {
//                                 _.each($scope.userModalData['Clients'], function(d, j){
//                                     if(permissions[i].clientId == d.id){
//                                         permissions[i].clientName = d.name;
//                                     }
//                                 });
//                             }
//                         });
//                     }
//                     if(editmode)
//                         setPreselectedPermission(userId);
                 },function(){

                 },'cancellable');
            },
            getUserBrands:function(clientId,advertiserId,accountIndex,permissionIndex,editmode,editData){
                var arr = null;
                accountsService.getAdvertisersBrand(clientId,advertiserId).then(function(res){
//                    if(res.data.data) {
//                        if(!$scope.userModalData[index]){
//                            $scope.userModalData[index] = {};
//                            $scope.userModalData[index]['Brands'] = [];
//                        }
//                        $scope.userModalData[index]['Brands'] = res.data.data;
//                        $scope.userModalData[index]['Brands'] = res.data.data;
//                    }
                    arr = res.data.data;
                    console.log("arr....",arr);
                    arr.unshift({id: -1, name: constants.ALL_BRANDS});
                    if(!$scope.dropdownList[accountIndex][permissionIndex]){
                        $scope.dropdownList[accountIndex][permissionIndex] = {}
                    }
                    $scope.dropdownList[accountIndex][permissionIndex]['brands'] = arr;
//                    if(editmode){
//                        var brandIndex = _.findIndex($scope.userModalData[index]['Brands'], function(item) {
//                            return item.id == editData.brandId});
//
//                        if(brandIndex != -1){
//                            $scope.selectBrand($scope.userModalData[index]['Brands'][brandIndex],index,editmode,editData);
//                        }
//                    }
                });

                //$scope.userModalData['Brands']=[{id:0,name:"All Brands"},{id:22,name:"brand1"},{id:23,name:"brand2"},{id:24,name:"brand3"}]

            },
            getUserAdvertiser:function(clientObj,accountIndex, permissionIndex, editmode,editData){
                accountsService.getClientsAdvertisers(clientObj.id).then(function(res){
                    var counter = accountsService.getCounter(),
                        arr = null;
                    var result = res.data.data;
                    if((res.status === "OK" || res.status === "success") && result.length){
                        arr = result;
                        arr.unshift({id: -1, name: constants.ALL_ADVERTISERS});
                        $scope.dropdownList[accountIndex]['advertisers'] = arr;

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
            getUserPages: function(){
                accountsService.getUserPages().then(function(res){
                    if(res.data.data) {
                        $scope.userPages = res.data.data;
                    }
                });
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
//        if(!$scope.editmode)
//            userModalPopup.getUserClients();
       // userModalPopup.getUserAdvertiser({id: 2}, 0);
       // userModalPopup.getUserBrands(2, 4, 0);
       // userModalPopup.getUserPermission();

        userModalPopup.getUserClients();
        userModalPopup.getUserPages();


        //set permissions in edit mode
        $rootScope.$on('permissionsForUsers',function(e,user){
            if(user) {
                $scope.resetFields(true);
                //  userModalPopup.getUserClients(true,user);
                //  userModalPopup.getUserPermission();
                setPreselectedPermission(user);
                _customctrl.editId = user[0].id;
            }else{
                _customctrl.editId = null;
            }
       //     $scope.createUser();
//            $scope.editmode = true;
        })

        function setPreselectedPermission(user){

            accountsService.getUsersDetails(user[0].id).then(function(res){
                $scope.User = {
                    data: []
                };
                _customctrl.responseData = res.data.data;
                editedUserDetails = _customctrl.responseData;
                $scope.userConsoleFormDetails.email = _customctrl.responseData.email;
                $scope.userConsoleFormDetails.firstName = _customctrl.responseData.firstName;
                $scope.userConsoleFormDetails.lastName = _customctrl.responseData.lastName;
                //$scope.userConsoleFormDetails.roleTemplateId = _customctrl.responseData.roleTemplateId;

                $scope.userConsoleFormDetails.isEditPassword = _customctrl.responseData.isCaasEnabled;
                if(_customctrl.responseData.isCaasEnabled) {
                    $scope.userConsoleFormDetails.password = "123456";
                } else {
                    $scope.userConsoleFormDetails.password = "";
                }


                _.each(_customctrl.responseData.permissions, function(item, i){
                    $scope.addPermission(i , true);
                    if(item.clientId){
                        userModalPopup.getUserAdvertiser({id:item.clientId}, i);
                    }
                    if(!$scope.pagePermissionValue[i]){
                        $scope.pagePermissionValue[i] = {desc:"", code:""}
                    }
                    _.each(item["resources"], function(d, j){
                        if(d.accessLevel == "admin"){
                            setTimeout(function(){
                                $('#admin-toggle-'+i).bootstrapToggle('on');
                                $scope.adminUserToggleClicked(i);
                            },1);
                        }
                        d.permissionName = d.accessLevel[0].toUpperCase() + d.accessLevel.slice(1);
                        if(d.advertiserId) {
                            userModalPopup.getUserBrands(item.clientId, d.advertiserId, i, j, true);
                        }
                    })
                    _.each(item["features"],function(d, j){

                        _.each($scope.userPages, function(p, k){
                            if(p.code == d){
                                $scope.pagePermissionValue[i].desc += ","+ p.description;
                            }
                        })
                    });
                });

                $scope.permissions = _customctrl.responseData.permissions;

                if(data.roleTemplateId == 1){
                      $scope.isCurr_SuperUser = true;
                      $scope.permissions = [];
                }

//                if(data.roleTemplateId != constants.super_admin){
//                    $scope.isSuperAdmin = false;
//                    for(var i = 0; i < data.permissions.length; i++){
//                        $scope.incrementCounter();
//                        var clientObj = getClientObject(data.permissions[i].clientId,data.permissions[i].orgId,data.permissions[i].resellerId);
//                      //  $scope.selectedClientHandler(clientObj,i,  data.permissions[i].orgId,data.permissions[i].resellerId,data.permissions[i]);
//                        $scope.User.data[i].accessLevel = data.permissions[i].accessLevel;
//                    }
//                }
//                else{
//                    $scope.isSuperAdmin = true;
//                }

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
        });

//        $(document).ready(function() {
//            $('#cmn-toggle-1').bootstrapToggle('off');
//            $('#cmn-toggle-1').change(function(event) {
//               console.log("Toggle happend");
//               // $scope.toggleSchedule(this);
//            });
//        });

        $scope.superUserToggleClicked = function(isCurr_SuperUser){
            $scope.isCurr_SuperUser = isCurr_SuperUser;
            if(!$scope.isCurr_SuperUser){
                $scope.permissions = []
            }
        }
        $scope.adminUserToggleClicked = function(accountIndex, permissionIndex){
            var sel = $("div[id*=resources_"+accountIndex+"_], #addPermissionText_"+accountIndex);
            if(!$("#admin-toggle-"+accountIndex).prop('checked')) {
                sel.show();
            }else{
                $scope.pagePermissionValue[accountIndex] = {desc: "Enable Access to all features", code: "ENABLE_ALL"}
                $scope.permissions[accountIndex].resources = [];
                sel.hide();
            }
        }

        $scope.select_page_option = function(desc, code, index){
            if($scope.pagePermissionValue[index]) {
                if(code == "ENABLE_ALL"){
                    $scope.pagePermissionValue[index] = {desc: desc, code: code}
                }else {
                    $scope.pagePermissionValue[index]["desc"] = $scope.pagePermissionValue[index]["desc"].replace("Enable Access to all features","");
                    $scope.pagePermissionValue[index]["code"] = $scope.pagePermissionValue[index]["code"].replace("ENABLE_ALL","");
                    $scope.pagePermissionValue[index]["desc"] += "," + desc;
                    $scope.pagePermissionValue[index]["code"] += "," + code;
                }
            }else{
                $scope.pagePermissionValue[index] = {desc: desc, code: code}
            }
        }
        $scope.select_client_option = function(id, name, accountIndex){
            console.log('id....'+id+'.....name....'+name+'....accountIndex..'+accountIndex);
            $scope.permissions[accountIndex].clientId = id;
            $scope.permissions[accountIndex].clientName = name;
            userModalPopup.getUserAdvertiser({id:id}, accountIndex);
        }
        $scope.addPermission = function(accountIndex, editMode){
            if(editMode){
                $scope.permissions[accountIndex] = {resources:[]}
                $scope.dropdownList[accountIndex] = {}
            }

            $scope.permissions[accountIndex].resources.push({"advertiserId": -1,
                                                                 "advertiserName": constants.ALL_ADVERTISERS,
                                                                 "brandId": -1,
                                                                 "brandName": constants.ALL_BRANDS,
                                                                 "permissionName": "Admin",
                                                                 "permissionValue": "admin"
                                                               });
            if(!$scope.dropdownList[accountIndex]["advertisers"]) {
                $scope.dropdownList[accountIndex]["advertisers"] = [];
            }
            if(!$scope.dropdownList[accountIndex]["permission"]) {
                $scope.dropdownList[accountIndex]["permission"] = [{value:"admin",name:"Admin"},{value:"write",name:"Write"},{value:"read",name:"Read"}];
            }
            var len = $scope.permissions[accountIndex].resources.length;
            if(!$scope.dropdownList[accountIndex][len - 1]) {
                $scope.dropdownList[accountIndex][len - 1] = {}
                $scope.dropdownList[accountIndex][len - 1]["brands"] = [];
            }
    //        userModalPopup.getUserAdvertiser({id:2}, _customctrl.accountIndex, len-1);
//            _.each($scope.permissions[accountIndex].resources, function(item, i){
//
//            })
           // $scope.dropdownList[accountIndex]["brands"] = [];
        }
        $scope.deletePermission = function(accountIndex, permissionIndex, event) {// the last one getting deleted always
            var arr = $scope.permissions[accountIndex].resources;
            $scope.permissions[accountIndex].resources = _(arr).filter(function(item, i) {
                return i !== permissionIndex;
            });
            //$scope.permissions[accountIndex].resources = arr;

            delete $scope.dropdownList[accountIndex][permissionIndex];
            delete $scope.dropdownList[accountIndex].advertisers;



//            var elem = $(event.target);
////            elem.closest(".add-filters").remove();
//            $scope.permissions.splice(index,1);
//            $scope.User.data.splice(index,1);
//            $scope.clientName.splice(index, 1);
//            $scope.userModalData.splice(index,1);
//            $scope.advertiserName.splice(index,1);
//            $scope.brandName.splice(index,1)


        };
        $scope.deleteAccount = function(accountIndex, event){
            var arr = $scope.permissions;
            $scope.permissions = _(arr).filter(function(item, i) {
                return i !== accountIndex;
            });
            //$scope.permissions = arr;

            arr = $scope.dropdownList;
            $scope.dropdownList = _(arr).filter(function(item, i) {
                return i !== accountIndex;
            });
        }
        $scope.subClientListData = {};
        $scope.getSubClientList = function(clientId, name, parentContianerId, accountIndex){
            if($('#clientDropdown_'+clientId).length) {
                $("#clientDropdown_"+parentContianerId).hide();
                $('#clientDropdown_'+clientId).show();
                return;
            }
            $scope.loadingClientDropDown = true;
            accountsService.getSubClients(clientId).then(function(res){
                var result = res.data.data;
                $scope.loadingClientDropDown = false;
                if ((res.status === "OK" || res.status === "success") && result.length) {
                    $("#clientDropdown_"+parentContianerId).hide();
                    $scope.subClientListData[clientId] = result;
                    //if(!$('#clientDropdown_'+clientId).length) {
                        angular.element(document.getElementById('accountDropDown')).append($compile('<div class="childTier" id="clientDropdown_' + clientId + '"><div class="tierHeader" id="' + parentContianerId + '" ng-click="goToParentClientList(' + parentContianerId + ',' + clientId + ')"><div class="icon-arrow-down"></div><span>' + name + '</span></div><ul class="dropdown-menu-child" data-toggle="dropdown"><li ng-repeat="client in subClientListData[' + clientId + ']"  id="topClients"><a ng-click="select_client_option(client.id, client.name, '+accountIndex+')" ng-bind="client.name"></a><span class="icon-arrow-down icon-arrow-right" ng-click="getSubClientList(client.id, client.name,'+clientId+','+accountIndex+' )" ng-if="!client.isLeafNode"></span></li></ul></div>')($scope));
//                    }else{
//                        $('#clientDropdown_'+clientId).show();
//                    }
                }else{
                    //$rootScope.setErrAlertMessage(constants.WF_USER_EDIT_FAIL);
                    console.log("Error: To get the sub-client list of "+name);
                }
            },function(err){
                //$rootScope.setErrAlertMessage(constants.WF_USER_EDIT_FAIL);
                console.log("Error: To get the sub-client list of "+name);
            });
        }

        $scope.goToParentClientList = function(parentContianerId, clientId){
            console.log("goToParentClientList...."+parentContianerId+"....clientId.."+clientId);
            $("#clientDropdown_"+parentContianerId).show();
            $("#clientDropdown_"+clientId).hide();
        }

        $("span[id*=parentCnt_]").on( "click", function(event) {
            var nowId = $(event).parent().attr("id");
            var toId = $(event).attr("id");
            $("#toId").show();
            $("#nowId").hide();
        });

    });




});
