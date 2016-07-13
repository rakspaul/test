define(['angularAMD', 'common/services/constants_service', 'workflow/services/account_service',
    'common/moment_utils', 'login/login_model', 'workflow/directives/ng_update_hidden_dropdown'],
    function (angularAMD) {
    'use strict';

    angularAMD.controller('UsersAddOrEdit', function ($scope, $rootScope, $compile, $q, constants, accountsService,
                                                     momentService, loginModel) {
        var _customctrl = this,
            defaultAccess = 'ADMIN',
            editedUserDetails = {},

            userModalPopup = {
                getUserClients: function () {
                    accountsService.getClients(function (res) {
                        $scope.userModalData.Clients = res.data.data;
                    }, function () {
                    }, 'cancellable');
                },

                getUserBrands: function (clientId, advertiserId, accountIndex, permissionIndex) {
                    var arr = null;

                    accountsService
                        .getAdvertisersBrand(clientId, advertiserId)
                        .then(function (res) {
                            arr = res.data.data;

                            if ((res.data.status === 'OK' || res.data.statusCode === 200) && arr) {
                                arr.unshift({id: -1, name: constants.ALL_BRANDS});

                                if (!$scope.dropdownList[accountIndex][permissionIndex]) {
                                    $scope.dropdownList[accountIndex][permissionIndex] = {};
                                }

                                $scope.dropdownList[accountIndex][permissionIndex].brands = arr;
                            }
                        });
                },

                getUserAdvertiser: function (clientObj, accountIndex, permissionIndex, editmode, editData) {
                    accountsService
                        .getClientsAdvertisers(clientObj.id)
                        .then(function (res) {
                            var arr = null,
                                result = res.data.data,
                                advertiserIndex;

                            if ((res.status === 'OK' || res.status === 'success') && result.length) {
                                arr = result;

                                arr.unshift({
                                    id: -1,
                                    name: constants.ALL_ADVERTISERS
                                });

                                $scope.dropdownList[accountIndex].advertisers = arr;

                                if (editmode) {
                                    advertiserIndex =
                                        _.findIndex($scope.userModalData[index].Advertisers, // jshint ignore:line
                                            function (item) {
                                                return item.id === editData.advertiserId;
                                            });

                                    if (advertiserIndex !== -1) {
                                        $scope.selectAdvertiser(
                                            $scope.userModalData[index] // jshint ignore:line
                                                .Advertisers[advertiserIndex],
                                            index, editmode, editData); // jshint ignore:line
                                    }
                                }
                            }
                        }, function (err) {
                            console.log('ERROR = ', err);
                        });
                },

                getUserPages: function () {
                    accountsService
                        .getUserPages()
                        .then(function (res) {
                            if (res.data.data) {
                                if (res.data.data[0].code === 'ENABLE_ALL') {
                                    res.data.data.shift();
                                }

                                $scope.userPages = res.data.data;
                            }
                        });
                },

                getUserPermission: function () {
                    $scope.userModalData.Permission = [
                        {value: 'ADMIN', name: 'Admin'},
                        {value: 'WRITE', name: 'Write'},
                        {value: 'READ',  name: 'Read'}
                    ];
                }
            };

        _customctrl.workflowUserPages = [
            {description: 'Creative library',  code: 'CREATIVE_LIST'},
            {description: 'Creative library',  code: 'MEDIAPLAN_HUB'},
            {description: 'Media Plan Set-up', code: 'MEDIAPLAN_SETUP'},
            {description: 'Ad Set-up Screens', code: 'AD_SETUP'}
        ];

        _customctrl.validateInputs = function () {
            var icheck = ['email', 'firstName', 'lastName', 'password'],
                len = icheck.length,
                retVal = true,
                i;

            for (i = 0; i < len; i++) {
                if (!_customctrl.validateVal($scope.userConsoleFormDetails[icheck[i]])) {
                    $rootScope.setErrAlertMessage('Please enter a valid user credentials');
                    return false;
                }
            }

            if (!$scope.isCurr_SuperUser && !$scope.permissions.length) {
                $rootScope.setErrAlertMessage(constants.ADMIN_ADD_PERMISSION);
                return false;
            }

            _.each($scope.permissions, function (item, i) {
                if (!item.clientId) {
                    $rootScope.setErrAlertMessage(constants.ADMIN_SELECT_CLIENT);
                    retVal = false;
                }

                if (retVal && !$('#admin-toggle-' + i).prop('checked') && (!item.resources || !item.resources.length)) {
                    $rootScope.setErrAlertMessage(constants.ADMIN_ADD_ADVERTISER_PERMISSION);
                    retVal = false;
                }
            });

            return retVal;
        };

        _customctrl.createData = function () {
            var features = [];

            _customctrl.requestData = {
                firstName: $scope.userConsoleFormDetails.firstName,
                lastName: $scope.userConsoleFormDetails.lastName,
                email: $scope.userConsoleFormDetails.email,
                password: $scope.userConsoleFormDetails.password,
                status: $scope.userConsoleFormDetails.status,
                permissions: []
            };

            _customctrl.requestData.roleTemplateId = ($scope.isCurr_SuperUser ? 1 : 2);

            if ($scope.editId) {
                _customctrl.requestData.id = $scope.editId;
                _customctrl.requestData.updatedAt = _customctrl.responseData.updatedAt;
            }

            _.each($scope.permissions, function (item, i) {
                features = [];

                _.each($scope.pagePermissionValue[i], function (f) {
                    features.push(f.code);
                });

                _customctrl.requestData.permissions.push({
                    clientId: $scope.permissions[i].clientId,
                    application: 'visto',
                    features: _.clone(features),
                    resources: []
                });

                if ($scope.pagePermissionValue[i][0].code === 'ENABLE_ALL' &&
                    !item.resources.length &&
                    $('#admin-toggle-' + i).prop('checked')) {
                    _customctrl.requestData.permissions[i].resources.push({
                        accessLevel: 'admin',
                        advertiserId: -1,
                        brandId: -1
                    });
                } else {
                    _.each(item.resources, function (d) {
                        _customctrl.requestData.permissions[i].resources.push({
                            accessLevel: d.permissionValue,
                            advertiserId: d.advertiserId,
                            brandId: d.brandId
                        });
                    });
                }
            });

            return _customctrl.requestData;
        };

        _customctrl.validateVal = function (val) {
            return (typeof val === 'undefined' || val.trim() === '') ? false : true;
        };

        _customctrl.filterRequestData = function () {
            var request = _customctrl.createData(),
                k;

            for (k in request) {
                if (request[k] === null) {
                    delete request[k];
                }
            }

            return request;
        };

        _customctrl.showUserForm = function () {
            $('.user-list, .users-creation-page .heading').fadeOut();
            $('.edit-dialog').fadeIn();
        };

        _customctrl.clearPermissions = function (accountIndex) {
            var sel = $('div[id*=resources_' + accountIndex + '_]');

            $scope.pagePermissionValue[accountIndex] = [{
                description: 'Enable Access to all features',
                code: 'ENABLE_ALL'
            }];

            $scope.permissions[accountIndex].resources = [];
            sel.hide();
        };

        _customctrl.clearDropList = function (accountIndex) {
            $scope.dropdownList[accountIndex] = {};
            $scope.permissions[accountIndex] = {};
        };

        _customctrl.clearBrands = function (accountIndex, permissionIndex) {
            $scope.dropdownList[accountIndex][permissionIndex].brands = [];
            $scope.permissions[accountIndex].resources[permissionIndex].brandName = constants.ALL_BRANDS;
            $scope.permissions[accountIndex].resources[permissionIndex].brandId = -1;
        };

        _customctrl.allPages = function (index, isSel) {
            _.each($scope.userPages, function (item) {
                $scope.userConsoleFormDetails[item.code + '_' + index + '_checked'] = isSel;
            });
        };

        function setPreselectedPermission(user) {
            accountsService
                .getUsersDetails(user[0].id)
                .then(function (res) {
                    $('#maskWindow').hide();

                    if (res && (res.data.statusCode === 200 || res.data.status === 'success')) {
                        _customctrl.showUserForm();

                        $scope.User = {
                            data: []
                        };

                        _customctrl.responseData = res.data.data;
                        editedUserDetails = _customctrl.responseData;
                        $scope.userConsoleFormDetails.email = _customctrl.responseData.email;
                        $scope.userConsoleFormDetails.firstName = _customctrl.responseData.firstName;
                        $scope.userConsoleFormDetails.lastName = _customctrl.responseData.lastName;
                        $scope.userConsoleFormDetails.status = _customctrl.responseData.status;
                        $scope.isCurr_SuperUser = (_customctrl.responseData.reportTemplateId === 1) ? true : false;

                        setTimeout(function () {
                            var cmnToggle = $('#cmn-toggle-1'),
                                userState = $('#userState');

                            if ($scope.isCurr_SuperUser && !cmnToggle.is(':checked')) {
                                cmnToggle.trigger('click');
                            }

                            if ($scope.userConsoleFormDetails.status && !userState.is(':checked')) {
                                userState.trigger('click');
                            }
                        }, 25);

                        $scope.userConsoleFormDetails.isEditPassword = _customctrl.responseData.isCaasEnabled;

                        if (_customctrl.responseData.isCaasEnabled) {
                            $scope.userConsoleFormDetails.password = '123456';
                        } else {
                            $scope.userConsoleFormDetails.password = '';
                        }

                        if (_customctrl.responseData.roleTemplateId === 1) {
                            $scope.isCurr_SuperUser = true;
                            $scope.permissions = [];
                            return;
                        }

                        _.each(_customctrl.responseData.permissions, function (item, i) {
                            $scope.incrementCounter();
                            $scope.permissions[i] = {resources: []};
                            $scope.dropdownList[i] = {};

                            if (item.clientId) {
                                userModalPopup.getUserAdvertiser({id: item.clientId}, i);
                            } else {
                                return true;
                            }

                            _.each(item.resources, function (d, j) {
                                $scope.addPermission(i);

                                if (item.resources.length === 1 &&
                                    d.accessLevel.toLowerCase() === 'admin' &&
                                    d.brandId === -1 &&
                                    d.advertiserId === -1) {

                                    setTimeout(function (i) {
                                        $('#admin-toggle-' + i).bootstrapToggle('on');
                                        $('#addPermissionText_' + i).hide();
                                        $scope.adminToggle[i] = true;
                                        _customctrl.allPages(i, true);
                                    }, 1, i);

                                    _customctrl.responseData.permissions[i].resources = [];
                                } else {
                                    d.permissionName =
                                        d.accessLevel[0].toUpperCase() + d.accessLevel.slice(1).toLowerCase();

                                    d.permissionValue = d.accessLevel.toLowerCase();
                                    d.advertiserName = (d.advertiserId === -1) ? 'All Advertisers' : d.advertiserName;
                                    d.brandName = (d.brandId === -1) ? 'All Brands' : d.brandName;
                                    $scope.permissions[i].resources.push(d);
                                    userModalPopup.getUserBrands(item.clientId, d.advertiserId, i, j, true);
                                }
                            });

                            $scope.pagePermissionValue[i] = [];
                            _customctrl.allPages(i, false);

                            _.each(item.features, function (d) {
                                if (d === 'ENABLE_ALL') {
                                    $scope.pagePermissionValue[i] = [{
                                        description: 'Enable Access to all features',
                                        code: 'ENABLE_ALL'
                                    }];

                                    _customctrl.allPages(i, true);
                                } else {
                                    _.each($scope.userPages, function (p) {
                                        if (p.code === d) {
                                            $scope.pagePermissionValue[i].push({
                                                description: p.description,
                                                code: p.code
                                            });

                                            $scope.userConsoleFormDetails[d + '_' + i + '_checked'] = true;
                                        }
                                    });
                                }
                            });
                        });

                        $scope.permissions = _customctrl.responseData.permissions;
                    } else {
                        $rootScope.setErrAlertMessage(res.data.data.message);
                    }
                });
        }

        function workflowSelected(accountIndex) {
            if ($scope.dropdownList[accountIndex].permission) {
                $scope.dropdownList[accountIndex].permission.length = 1;
            }

            if ($scope.permissions[accountIndex].resources.length) {
                $scope.permissions[accountIndex].resources[0].permissionName = 'Write';
                $scope.permissions[accountIndex].resources[0].permissionValue = 'write';
            }
        }

        function workflowUnselected(accountIndex) {
            // Append 'Read' if it is not already present.
            if ($scope.dropdownList[accountIndex].permission &&
                $scope.dropdownList[accountIndex].permission.length === 1) {
                $scope.dropdownList[accountIndex].permission.push({value: 'read', name: 'Read'});
            }
        }

        $scope.showSuperAdminButton = loginModel.getClientData().is_super_admin;
        $scope.editId = null;
        $scope.count = 0;
        $scope.permissions = [];
        $scope.pagePermissionValue = [];
        $scope.dropdownList = [];
        $scope.adminToggle = [];
        $scope.isSuperAdmin = true;
        $scope.clientName = [];
        $scope.loadingClientDropDown = {};
        $scope.advertiserName = [];
        $scope.brandName = [];

        $scope.User = {
            data: []
        };

        $scope.Usernew = {
            data: []
        };

        if (!$scope.userModalData) {
            $scope.userModalData = [];
        }

        $scope.editmode = false;
        $scope.userConsoleFormDetails.roleTemplateId = constants.account_admin;

        $scope.close = function () {
            $scope.userConsoleFormDetails.status = false;
        };

        $scope.closeForm = function () {
            $('.user-list, .users-creation-page .heading').fadeIn();
            $('.edit-dialog').fadeOut();

            _.each($scope.pagePermissionValue, function (item, i) {
                _customctrl.allPages(i, true);
            });

            setTimeout(function () {
                var cmnToggle = $('#cmn-toggle-1'),
                    userState = $('#userState');

                if (cmnToggle.is(':checked')) {
                    cmnToggle.trigger('click');
                }

                if (userState.is(':checked')) {
                    userState.trigger('click');
                }
            }, 25);
        };

        $scope.selectedRole = function (roleType) {
            if (roleType === constants.super_admin) {
                $scope.isSuperAdmin = true;
                $scope.permissions = [];
            } else {
                $scope.isSuperAdmin = false;
            }
        };

        $scope.saveUserForm = function ( ) {
            var requestData = _customctrl.filterRequestData(),
                successMsg = $scope.editId ? constants.WF_USER_EDIT_SUCCESS : constants.WF_USER_CREATION_SUCCESS,
                errMsg = $scope.editId ? constants.WF_USER_EDIT_FAIL : constants.WF_USER_CREATION_FAIL;

            if (!_customctrl.validateInputs()) {
                return;
            }

            if ($scope.editId) {
                accountsService
                    .updateUser(requestData)
                    .then(function (res) {
                        if (res.status === 'OK' || res.status === 'success') {
                            $('.user-list, .users-creation-page .heading').fadeIn();
                            $('.edit-dialog').fadeOut();
                            $rootScope.$broadcast('refreshUserList');
                            $scope.resetFields();
                            $rootScope.setErrAlertMessage(successMsg, 0);
                        } else {
                            $rootScope.setErrAlertMessage(res.data.data.message);
                        }
                    }, function (err) {
                        $rootScope.setErrAlertMessage(errMsg);
                        console.log('Error: ', err);
                    });
            } else {
                accountsService
                    .createUser(requestData)
                    .then(function (res) {
                        if (res.status === 'OK' || res.status === 'success') {
                            $('.user-list, .users-creation-page .heading').fadeIn();
                            $('.edit-dialog').fadeOut();
                            $rootScope.$broadcast('refreshUserList');
                            $scope.resetFields();
                            $rootScope.setErrAlertMessage(successMsg, 0);
                        } else {
                            $rootScope.setErrAlertMessage(res.data.data.message);
                        }
                    }, function (err) {
                        $rootScope.setErrAlertMessage(errMsg);
                        console.log('Error: ', err);
                    });
            }
        };

        $scope.selectAdvertiser = function (advertiserObj, accountIndex, permissionIndex) {
            var isAlreadySelected = false;

            _.each($scope.permissions[accountIndex].resources, function (item) {
                if (item.advertiserId === advertiserObj.id) {
                    isAlreadySelected = true;
                }
            });

            if (!isAlreadySelected) {
                _customctrl.clearBrands(accountIndex, permissionIndex);
                $scope.permissions[accountIndex].resources[permissionIndex].advertiserName = advertiserObj.name;
                $scope.permissions[accountIndex].resources[permissionIndex].advertiserId = advertiserObj.id;

                userModalPopup.getUserBrands($scope.permissions[accountIndex].clientId,
                    advertiserObj.id, accountIndex, permissionIndex);
            } else {
                $rootScope.setErrAlertMessage(constants.ADVERTISERID_EXIST);
                return false;
            }
        };

        $scope.selectBrand = function (brandObj, accountIndex, permissionIndex) {
            $scope.permissions[accountIndex].resources[permissionIndex].brandName = brandObj.name;
            $scope.permissions[accountIndex].resources[permissionIndex].brandId = brandObj.id;
        };

        $scope.selectPermission = function (permissionObj, accountIndex, permissionIndex) {
            $scope.permissions[accountIndex].resources[permissionIndex].permissionName = permissionObj.name;
            $scope.permissions[accountIndex].resources[permissionIndex].permissionValue = permissionObj.value;
        };

        accountsService.initCounter();

        $scope.incrementCounter = function () {
            _customctrl.accountIndex = accountsService.getCounter();
            $scope.pagePermissionValue[_customctrl.accountIndex] = [];

            $scope.pagePermissionValue[_customctrl.accountIndex].push({
                description: 'Enable Access to all features',
                code: 'ENABLE_ALL'
            });

            accountsService.setCounter();

            if (!$scope.User.data[accountsService.getCounter() - 1]) {
                $scope.User.data[accountsService.getCounter() - 1] = {};
            }

            $scope.User.data[accountsService.getCounter() - 1].accessLevel = defaultAccess;

            $scope.permissions.push({
                resources: [],
                clientName: 'Select Account'
            });

            $scope.dropdownList.push({
                clients: [],
                pages:[]
            });

            $scope.adminToggle.push(false);

            if (!$scope.editId) {
                _customctrl.allPages(_customctrl.accountIndex, true);
            }
        };

        $scope.setPermissionAccess = function (index, val) {
            $scope.User.data[index].accessLevel = val;
        };

        $scope.resetFields = function (isInitialEdit) {
            $scope.userConsoleFormDetails.id = undefined;
            $scope.userConsoleFormDetails.email = undefined;
            $scope.userConsoleFormDetails.firstName = undefined;
            $scope.permissions = [];
            $scope.userConsoleFormDetails.lastName = undefined;
            $scope.userConsoleFormDetails.password = undefined;
            $scope.userConsoleFormDetails.roleTemplateId = undefined;
            $scope.userConsoleFormDetails.isEditPassword = undefined;
            $scope.userConsoleFormDetails.updatedAt = undefined;
            $scope.userConsoleFormDetails.status = true;
            $scope.clientName = [];
            $scope.userModalData = [];
            $scope.advertiserName=[];
            $scope.brandName=[];
            $scope.adminToggle = [];
            $scope.User = {data: []};
            $scope.isSuperAdmin = false;
            accountsService.initCounter();
            editedUserDetails = {};

            if (!isInitialEdit) {
                $scope.close();
            }
        };

        $scope.resetFields();
        userModalPopup.getUserClients();
        userModalPopup.getUserPages();

        //set permissions in edit mode
        $rootScope.$on('permissionsForUsers', function (e, user) {
            $scope.resetFields(true);
            userModalPopup.getUserClients();

            if (user) {
                setPreselectedPermission(user);
                $scope.editId = user[0].id;
            } else {
                _customctrl.showUserForm();
                $scope.editId = null;
            }
        });

        $scope.selectClientOption = function (id, name, accountIndex) {
            var isAlreadySelected = false;

            _.each($scope.permissions, function (item) {
                if (item.clientId === id) {
                    isAlreadySelected = true;
                }
            });

            if (!isAlreadySelected) {
                _customctrl.clearDropList(accountIndex);
                _customctrl.clearPermissions(accountIndex);
                $scope.permissions[accountIndex].clientId = id;
                $scope.permissions[accountIndex].clientName = name;
                userModalPopup.getUserAdvertiser({id: id}, accountIndex);
                $('.clientDropdownCnt , .childTier').hide();
            } else {
                $rootScope.setErrAlertMessage(constants.CLIENTID_EXIST);
                return false;
            }
        };

        $scope.openAccountsDropdown = function (event) {
            $(event.target).closest('.dropdown').find('.dropdown-menu').show();
        };

        $scope.addPermission = function (accountIndex) {
            var len;

            $scope.permissions[accountIndex].resources.push({
                advertiserId: -1,
                advertiserName: constants.ALL_ADVERTISERS,
                brandId: -1,
                brandName: constants.ALL_BRANDS,
                permissionName: 'Write',
                permissionValue: 'write'
            });

            if (!$scope.dropdownList[accountIndex].advertisers) {
                $scope.dropdownList[accountIndex].advertisers = [];
            }

            if (!$scope.dropdownList[accountIndex].permission) {
                $scope.dropdownList[accountIndex].permission = [
                    {value: 'write', name: 'Write'}
                ];
            }

            len = $scope.permissions[accountIndex].resources.length;

            if (!$scope.dropdownList[accountIndex][len - 1]) {
                $scope.dropdownList[accountIndex][len - 1] = {};
                $scope.dropdownList[accountIndex][len - 1].brands = [];
            }
        };

        $scope.deletePermission = function (accountIndex, permissionIndex) {
            var arr = $scope.permissions[accountIndex].resources;

            $scope.permissions[accountIndex].resources = _(arr).filter(function (item, i) {
                return i !== permissionIndex;
            });

            delete $scope.dropdownList[accountIndex][permissionIndex];
            delete $scope.dropdownList[accountIndex].advertisers;
        };

        $scope.deleteAccount = function (accountIndex) {
            $scope.permissions = _($scope.permissions).filter(function (item, i) {
                return i !== accountIndex;
            });

            $scope.dropdownList = _($scope.dropdownList).filter(function (item, i) {
                return i !== accountIndex;
            });

            $scope.pagePermissionValue =
                _($scope.pagePermissionValue).filter(function (item, i) {
                    return i !== accountIndex;
                });

            $scope.adminToggle = _($scope.adminToggle).filter(function (item, i) {
                return i !== accountIndex;
            });

            _.each($scope.adminToggle, function (value, i) {
                if (accountIndex === i) {
                    setTimeout(function (i) {
                        if (value) {
                            $('#admin-toggle-' + i).bootstrapToggle('on');
                            $('#addPermissionText_' + i).hide();
                        } else {
                            $('#admin-toggle-' + i).bootstrapToggle('off');
                            $('#addPermissionText_' + i).show();
                        }
                    }, 500, i);
                }
            });
        };

        $scope.permissionAll = function (accountIndex) {
            _customctrl.allPages(accountIndex, true);

            $scope.pagePermissionValue[accountIndex] = [{
                description: 'Enable Access to all features',
                code: 'ENABLE_ALL'
            }];

            workflowSelected(accountIndex);
        };

        $scope.permissionUnAll = function (accountIndex) {
            _customctrl.allPages(accountIndex, false);
            $scope.pagePermissionValue[accountIndex] = [];

            workflowUnselected(accountIndex);
        };

        $scope.permissionRepOnly = function (accountIndex) {
            var found;

            _customctrl.allPages(accountIndex, true);

            _.each(_customctrl.workflowUserPages, function (item) {
                $scope.userConsoleFormDetails[item.code + '_' + accountIndex + '_checked'] = false;
            });

            $('input[name="CREATIVE_LIST"],' +
                ' input[name="MEDIAPLAN_HUB"],' +
                ' input[name="MEDIAPLAN_SETUP"],' +
                ' input[name="AD_SETUP"]')
                .prop('checked', false);

            $scope.pagePermissionValue[accountIndex] = [];

            _.each($scope.userPages, function (item) {
                found = false;

                _.each(_customctrl.workflowUserPages, function (wItem) {
                    if (item.code === wItem.code) {
                        found = true;
                    }
                });

                if (!found) {
                    $scope.pagePermissionValue[accountIndex].push({
                        code: item.code,
                        description: item.description
                    });
                }
            });

            workflowUnselected(accountIndex);
        };

        $scope.selectUserPage = function (accountIndex, page) {
            var workflowPages = $('input[name="CREATIVE_LIST"],' +
                ' input[name="MEDIAPLAN_HUB"],' +
                ' input[name="MEDIAPLAN_SETUP"],' +
                ' input[name="AD_SETUP"]'),
                isWorkflowPageSelected = false;

            _.each(workflowPages, function (page) {
                if ($(page).prop('checked')) {
                    isWorkflowPageSelected = true;
                }
            });

            if (isWorkflowPageSelected) {
                workflowSelected(accountIndex);
            } else {
                workflowUnselected(accountIndex);
            }

            if ($scope.userConsoleFormDetails[page.code + '_' + accountIndex + '_checked']) {
                $scope.pagePermissionValue[accountIndex].push({
                    code: page.code,
                    description: page.description
                });
            } else {
                $scope.pagePermissionValue[accountIndex] = [];

                _.each($scope.userPages, function (item) {
                    if ($scope.userConsoleFormDetails[item.code + '_' + accountIndex + '_checked']) {
                        $scope.pagePermissionValue[accountIndex].push({
                            code: item.code,
                            description: item.description
                        });
                    }
                });
            }
        };

        $scope.superUserToggleClicked = function (isCurr_SuperUser) {
            $scope.isCurr_SuperUser = isCurr_SuperUser;

            if ($scope.isCurr_SuperUser) {
                $scope.permissions = [];
            }
        };

        $scope.adminUserToggleClicked = function (accountIndex, ev) {
            var sel;

            if (ev.target.outerHTML.search('id') === -1) {
                $scope.adminToggle[accountIndex] = !$scope.adminToggle[accountIndex];
                sel = $('div[id*=resources_' + accountIndex + '_], #addPermissionText_' + accountIndex);

                if (!$scope.adminToggle[accountIndex]) {
                    sel.show();
                } else {
                    _customctrl.allPages(accountIndex, true);
                    sel.hide();
                    _customctrl.clearPermissions(accountIndex);
                }
            }
        };

        $scope.subClientListData = {};

        $scope.getSubClientList = function (clientId, name, parentContianerId, accountIndex) {
            var sel = '#accountDropDown_'+accountIndex + ' #clientDropdown_';

            if ($(sel + clientId).length) {
                $(sel + parentContianerId).hide();
                $(sel + clientId).show();
                return;
            }

            $scope.loadingClientDropDown[accountIndex] = true;

            accountsService
                .getSubClients(clientId)
                .then(function (res) {
                    var result = res.data.data;

                    $scope.loadingClientDropDown[accountIndex] = false;

                    if ((res.status === 'OK' || res.status === 'success') && result.length) {
                        $(sel+parentContianerId).hide();
                        $scope.subClientListData[clientId] = result;

                        angular
                            .element(document.getElementById('accountDropDown_' + accountIndex))
                            .append($compile(
                                '<div class="childTier" id="clientDropdown_' + clientId +
                                '"><div class="tierHeader" id="' + parentContianerId +
                                '" ng-click="goToParentClientList(' + parentContianerId + ',' +
                                clientId + ',' + accountIndex +
                                ')"><div class="icon-arrow-solid-down"></div><span>' + name +
                                '</span></div><ul class="dropdown-menu-child" data-toggle="dropdown">' +
                                '<li ng-repeat="client in subClientListData[' + clientId +
                                ']"  id="topClients"><a ng-click="selectClientOption(client.id, client.name, ' +
                                accountIndex + ')" ng-bind="client.name"></a>' +
                                '<span class="icon-arrow-solid-down icon-arrow-right"' +
                                'ng-click="getSubClientList(client.id, client.name,' + clientId + ',' + accountIndex +
                                ' )" ng-if="!client.isLeafNode"></span></li></ul></div>'
                            )($scope));
                    } else {
                        console.log('Error: To get the sub-client list of ' + name);
                    }
                },function (err) {
                    console.log('Error: To get the sub-client list of ' + name, ' (', err, ')');
                });
        };

        $scope.goToParentClientList = function (parentContianerId, clientId, accountIndex) {
            var sel = '#accountDropDown_' + accountIndex + ' #clientDropdown_';

            $(sel+clientId).hide();
            $(sel+parentContianerId).show();
        };

        $scope.animateClientDropdown = function (toId, fromId, direction) {
            if (direction === 'toRight') {
                $('#clientDropdown_' + toId)
                    .css({
                        left: '-300px',
                        display: 'block',
                        zIndex: '1001'
                    })
                    .animate({'left':'0px'}, 500, function () {
                        $('#clientDropdown_'+fromId).hide();
                    });

                $('#clientDropdown_' + fromId).css({zIndex: '1000'});
            }
        };

        $scope.addPagePermissionFilter = function (accountIndex) {
            if ($scope.adminToggle[accountIndex]) {
                $rootScope.setErrAlertMessage(constants.ADMIN_PAGE_PERMISSION);
                $scope.pagePermissionValue[accountIndex].splice(1, 1);
            } else if ($scope.pagePermissionValue[accountIndex][0].code==='ENABLE_ALL') {
                //as it is always going to be the first element
                $scope.pagePermissionValue[accountIndex].splice(0, 1);
            }

            return true;
        };

        $scope.removePagePermissionFilter = function (accountIndex) {
            if ($scope.pagePermissionValue[accountIndex].length === 0) {
                $scope.pagePermissionValue[accountIndex] = [{
                    description: 'Enable Access to all features',
                    code: 'ENABLE_ALL'
                }];
            }

            return true;
        };

        $scope.loadPagePermissionList = function () {
            var deferred = $q.defer();

            deferred.resolve($scope.userPages);

            return deferred.promise;
        };
    });
});
