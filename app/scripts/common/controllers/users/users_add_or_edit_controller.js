
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
        $scope.loadingClientDropDown = {}
        $scope.advertiserName = [];
        $scope.brandName = [];
        $scope.User = {
            data: []
        };
        $scope.Usernew = {
            data: []
        };
        if(!$scope.userModalData) {
            $scope.userModalData = [];
        }

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
            if(!$scope.isCurr_SuperUser && !$scope.permissions.length){
                $rootScope.setErrAlertMessage(constants.ADMIN_ADD_PERMISSION);
                return false;
            }
            _.each($scope.permissions, function(item, i){
                if(!item.clientId){
                    $rootScope.setErrAlertMessage(constants.ADMIN_SELECT_CLIENT);
                    retVal = false;
                }
                if(retVal && !$("#admin-toggle-"+i).prop('checked') && (!item.resources || !item.resources.length)){
                    $rootScope.setErrAlertMessage(constants.ADMIN_ADD_ADVERTISER_PERMISSION);
                    retVal = false;
                }
            });
            return retVal;
        }
        _customctrl.createData = function(){
            var timeNow = momentService.newMoment(moment().format("MM/DD/YYYY")).format('YYYY-MM-DD HH-MM-SS.SSS');
            _customctrl.requestData = {
                "firstName": $scope.userConsoleFormDetails.firstName,
                "lastName": $scope.userConsoleFormDetails.lastName,
                "email": $scope.userConsoleFormDetails.email,
                "password": $scope.userConsoleFormDetails.password,
                "status": true,
                "permissions": []
            }
            _customctrl.requestData.permissions = _customctrl.requestData.permissions;
            _customctrl.requestData.roleTemplateId = ($scope.isCurr_SuperUser ? 1 : 2);
            if(_customctrl.editId){
                _customctrl.requestData.id = _customctrl.editId;
                _customctrl.requestData.updatedAt = _customctrl.responseData.updatedAt;
            }
            _.each($scope.permissions, function(item, i){
                _customctrl.requestData.permissions.push({
                    "clientId" : $scope.permissions[i].clientId,
                    "application": "visto",
                    "features": $scope.pagePermissionValue[i]["code"].split(","),
                    "resources": []
                });
                if($scope.pagePermissionValue[i]["code"] == "ENABLE_ALL" && !item.resources.length && $("#admin-toggle-"+i).prop('checked')){
                    _customctrl.requestData.permissions[i].resources.push({
                        "accessLevel": "admin",
                        "advertiserId": -1,
                        "brandId": -1,
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
                _customctrl.requestData.permissions[i].features = _.filter(item.features, function(item){ return item; });
            });
            return _customctrl.requestData;
        }

//        $scope.saveUserForm=function(){
//              console.log("Data",_customctrl.createData());
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
//        };
//        $scope.updateUser = function(postDataObj){
//
//            accountsService.updateUser(postDataObj,editedUserDetails).then(function(res){
//                if (res.status === "OK" || res.status === "success") {
//                    $rootScope.$broadcast('refreshUserList');
//                    $scope.resetFields();
//                    $rootScope.setErrAlertMessage(constants.WF_USER_EDIT_SUCCESS, 0);
//                }
//                else{
//                    $rootScope.setErrAlertMessage(constants.WF_USER_EDIT_FAIL);
//                }
//            },function(err){
//                $rootScope.setErrAlertMessage(constants.WF_USER_EDIT_FAIL);
//            });
//
//        };
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
            if(!_customctrl.validateInputs()){
                return;
            }
            accountsService.createUser(_customctrl.filterRequestData()).then(function(res){
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

//        $scope.selectedClientHandler=function(clientObj,index, orgId, resellerId,editData){

//            var counter=accountsService.getCounter();
//            if(!$scope.User.data[index]){
//                $scope.User.data[index] = {};
//                $scope.User.data[index].accessLevel = "ADMIN";
//            }
//
//            $scope.selectedClient={};
//            if(clientObj.clientType === "ORGANIZATION") {
//                $scope.User.data[index].orgId = clientObj.id;
//                $scope.User.data[index].resellerId = -1;
//                $scope.User.data[index].clientId = -1;
//            } else if(clientObj.clientType === "RESELLER") {
//                $scope.User.data[index].resellerId = clientObj.id;
//                $scope.User.data[index].orgId = orgId;
//                $scope.User.data[index].clientId = -1;
//            } else {
//                $scope.User.data[index].orgId = orgId;
//                if(resellerId) {
//                    $scope.User.data[index].resellerId = resellerId;
//                } else {
//                    $scope.User.data[index].resellerId = 0;
//                }
//                $scope.User.data[index].clientId = clientObj.id;
//            }
//
//            $scope.clientName[index] = clientObj.name;
//
//            //initialize advertiser,brand
//            if(!$scope.userModalData[index]){
//                $scope.userModalData[index] = {};
//                $scope.userModalData[index]['Advertisers'] = [];
//            }
//
//            //hard reset advertiser and brand and permission before populating
//            $scope.advertiserName[index] = "Select Advertiser";
//            $scope.User.data[index].advertiserId = '-1';
//            $scope.userModalData[index].Advertisers = [];
//            $scope.brandName[index] = "Select Brand";
//            $scope.User.data[index].brandId = '-1';
//            $scope.userModalData[index].Brands = [];
//
//            //populate advertiser based on selected client
//            if(editData)
//                userModalPopup.getUserAdvertiser(clientObj,index,true,editData);
//            else
//                userModalPopup.getUserAdvertiser(clientObj,index);

//            $scope.selectedClient['counter']=$scope.allPermissions[index].name;
//        };

        $scope.selectAdvertiser=function(advertiserObj,accountIndex, permissionIndex,editmode,editData){
            $scope.permissions[accountIndex].resources[permissionIndex]["advertiserName"] = advertiserObj.name;
            $scope.permissions[accountIndex].resources[permissionIndex]["advertiserId"] = advertiserObj.id;
            userModalPopup.getUserBrands($scope.permissions[accountIndex].clientId, advertiserObj.id, accountIndex, permissionIndex);
        };

        $scope.selectBrand=function(brandObj, accountIndex, permissionIndex){
            $scope.permissions[accountIndex].resources[permissionIndex]["brandName"] = brandObj.name;
            $scope.permissions[accountIndex].resources[permissionIndex]["brandId"] = brandObj.id;
        };
        $scope.selectPermission=function(permissionObj, accountIndex, permissionIndex){
            $scope.permissions[accountIndex].resources[permissionIndex]["permissionName"] = permissionObj.name;
            $scope.permissions[accountIndex].resources[permissionIndex]["permissionValue"] = permissionObj.value;
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
                 },function(){

                 },'cancellable');
            },
            getUserBrands:function(clientId,advertiserId,accountIndex,permissionIndex,editmode,editData){
                var arr = null;
                accountsService.getAdvertisersBrand(clientId,advertiserId).then(function(res){
                    arr = res.data.data;
                    if((res.data.status == "OK" || res.data.statusCode == 200)&& arr) {
                        arr.unshift({id: -1, name: constants.ALL_BRANDS});
                        if (!$scope.dropdownList[accountIndex][permissionIndex]) {
                            $scope.dropdownList[accountIndex][permissionIndex] = {}
                        }
                        $scope.dropdownList[accountIndex][permissionIndex]['brands'] = arr;
                    }
                });
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
                    }
                });
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
            console.log("clear");
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
        userModalPopup.getUserClients();
        userModalPopup.getUserPages();

        //set permissions in edit mode
        $rootScope.$on('permissionsForUsers',function(e,user){
            $scope.resetFields(true);
            userModalPopup.getUserClients();
            if(user) {
                setPreselectedPermission(user);
                _customctrl.editId = user[0].id;
            }else{
                _customctrl.editId = null;
            }
        });

        function setPreselectedPermission(user){

            accountsService.getUsersDetails(user[0].id).then(function(res){
                $scope.User = {
                    data: []
                };
                _customctrl.responseData = res.data.data;
                console.log(JSON.stringify(_customctrl.responseData));
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
                    if(item.clientId){
                        userModalPopup.getUserAdvertiser({id:item.clientId}, i);
                    }else{
                        return true;
                    }
                    $scope.addPermission(i , true);
                    //if(!$scope.pagePermissionValue[i]){
                        $scope.pagePermissionValue[i] = {desc:"", code:""}
                    //}
                    _.each(item["resources"], function(d, j){
                        console.log("ddddddddddd......",JSON.stringify(d));
                        if(d.accessLevel.toLowerCase() == "admin"){
                            setTimeout(function(i){
                                $('#admin-toggle-'+i).bootstrapToggle('on');
                               // $scope.adminUserToggleClicked(i);
                            },1,i);
                        }
                        d.permissionName = d.accessLevel[0].toUpperCase() + d.accessLevel.slice(1);
                        d.permissionValue = d.accessLevel.toLowerCase();
                        if(d.advertiserId) {
                           // console.log("Calling brand API....1...");
                            d.advertiserName = (d.advertiserId == -1) ? "All Advertisers" : d.advertiserName;
                            d.brandName = (d.brandId == -1) ? "All Brands" : d.brandName;
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
                console.log("_customctrl.responseData.permissions......",_customctrl.responseData.permissions);
                $scope.permissions = _customctrl.responseData.permissions;

                if(_customctrl.responseData.roleTemplateId == 1){
                      $scope.isCurr_SuperUser = true;
                      $scope.permissions = [];
                }
            })
        }

        //get client object based on id
//        function getClientObject(clientId,orgId,resellerId){
//                var finalClientObj;
//                //var flattenedClient = _.flatten($scope.userModalData['Clients'])
//                //console.log("flattentd cleint",flattenedClient);
//             //   console.log("orgId = ",orgId,"resellerId = ",resellerId,"clientId = ",clientId);
//
//                var orgIndex = _.findIndex($scope.userModalData['Clients'], function(item) {
//                return item.id == orgId});
//
//                if(orgIndex != -1){
//                    if(resellerId == -1 && clientId == -1){
//                        finalClientObj =  $scope.userModalData['Clients'][orgIndex];
//                    }  else if(resellerId == 0 && clientId > 0){
//                        var clientIndex = _.findIndex($scope.userModalData['Clients'][orgIndex]['children'] , function(item) {
//                            return item.id == clientId});
//                        finalClientObj = $scope.userModalData['Clients'][orgIndex]['children'][clientIndex];
//                    }  else if(resellerId > 0 && clientId > 0){
//                        var resellerIndex = _.findIndex($scope.userModalData['Clients'][orgIndex]['children'], function(item) {
//                            return item.id == resellerId});
//                        var clientIndex = _.findIndex($scope.userModalData['Clients'][orgIndex]['children'][resellerIndex]['children'], function(item) {
//                            return item.id == resellerId});
//                        finalClientObj = $scope.userModalData['Clients'][orgIndex]['children'][resellerIndex]['children'][clientIndex];
//                    } else if(resellerId > 0 && clientId < 0){
//                        var resellerIndex = _.findIndex($scope.userModalData['Clients'][orgIndex]['children'], function(item) {
//                            return item.id == resellerId});
//                        finalClientObj = $scope.userModalData['Clients'][orgIndex]['children'][resellerIndex];
//                    }
//
//                }
//
//               // console.log("finalClientObj =",finalClientObj);
//            return finalClientObj;
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



//        }

        $rootScope.$on('resetUserModal',function(){
            //$scope.resetFields(true);
        });

        $scope.superUserToggleClicked = function(isCurr_SuperUser){
            $scope.isCurr_SuperUser = isCurr_SuperUser;
            if(!$scope.isCurr_SuperUser){
                $scope.permissions = []
            }
        }
        $scope.adminUserToggleClicked = function(accountIndex, permissionIndex){
            var sel = $("div[id*=resources_"+accountIndex+"_], #addPermissionText_"+accountIndex);
            console.log("Checked....."+$("#admin-toggle-"+accountIndex).prop('checked'));
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
            $(".clientDropdownCnt , .childTier").hide() ;
        }
        $scope.open_accounts_dropdown = function(event, id) {
            setTimeout(function(){
                var elem = $(event.target);
                elem.closest(".dropdown").find(".dropdown-menu").show();
                console.log(elem.closest(".dropdown").find(".dropdown-menu")) ;
            },1);
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
        }
        $scope.deletePermission = function(accountIndex, permissionIndex, event) {// the last one getting deleted always
            var arr = $scope.permissions[accountIndex].resources;
            $scope.permissions[accountIndex].resources = _(arr).filter(function(item, i) {
                return i !== permissionIndex;
            });
            delete $scope.dropdownList[accountIndex][permissionIndex];
            delete $scope.dropdownList[accountIndex].advertisers;
        };
        $scope.deleteAccount = function(accountIndex, event){
            var arr = $scope.permissions;
            $scope.permissions = _(arr).filter(function(item, i) {
                return i !== accountIndex;
            });
            arr = $scope.dropdownList;
            $scope.dropdownList = _(arr).filter(function(item, i) {
                return i !== accountIndex;
            });
        }
        $scope.subClientListData = {};
        $scope.getSubClientList = function(clientId, name, parentContianerId, accountIndex){
            console.log("getSubClientList...."+accountIndex);
            var sel = '#accountDropDown_'+accountIndex+' #clientDropdown_';
            if($(sel+clientId).length) {
                $(sel+parentContianerId).hide();
               // $('#clientDropdown_'+clientId).show();
                setTimeout(function(){
                    $(sel+clientId).show();
                },1);
                return;
            }
            $scope.loadingClientDropDown[accountIndex] = true;
            accountsService.getSubClients(clientId).then(function(res){
                var result = res.data.data;
                $scope.loadingClientDropDown[accountIndex] = false;
                if ((res.status === "OK" || res.status === "success") && result.length) {
                    $(sel+parentContianerId).hide();
                    $scope.subClientListData[clientId] = result;
                    angular.element(document.getElementById('accountDropDown_'+accountIndex)).append($compile('<div class="childTier" id="clientDropdown_' + clientId + '"><div class="tierHeader" id="' + parentContianerId + '" ng-click="goToParentClientList(' + parentContianerId + ',' + clientId + ','+accountIndex+')"><div class="icon-arrow-down"></div><span>' + name + '</span></div><ul class="dropdown-menu-child" data-toggle="dropdown"><li ng-repeat="client in subClientListData[' + clientId + ']"  id="topClients"><a ng-click="select_client_option(client.id, client.name, '+accountIndex+')" ng-bind="client.name"></a><span class="icon-arrow-down icon-arrow-right" ng-click="getSubClientList(client.id, client.name,'+clientId+','+accountIndex+' )" ng-if="!client.isLeafNode"></span></li></ul></div>')($scope));
                }else{
                    console.log("Error: To get the sub-client list of "+name);
                }
            },function(err){
                console.log("Error: To get the sub-client list of "+name);
            });
        }

        $scope.goToParentClientList = function(parentContianerId, clientId, accountIndex){
            console.log("goToParentClientList...."+accountIndex);
            var sel = '#accountDropDown_'+accountIndex+' #clientDropdown_';
           $(sel+clientId).hide();
           setTimeout(function(){
               $(sel+parentContianerId).show();
           },1);
        }

        $scope.animateClientDropdown = function(toId, fromId, direction){
            if(direction == "toRight"){
                $("#clientDropdown_"+toId).css({left:"-300px","display":"block", "z-index":"1001"}).animate({"left":"0px"},500,function(){
                    $("#clientDropdown_"+fromId).hide();
                });
                $("#clientDropdown_"+fromId).css({"z-index":"1000"})
            }
        }
        $("span[id*=parentCnt_]").on( "click", function(event) {
            var nowId = $(event).parent().attr("id");
            var toId = $(event).attr("id");
            $("#toId").show();
            $("#nowId").hide();
        });

    });




});
