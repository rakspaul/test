define(['angularAMD', 'common-utils', 'accounts-add-or-edit-advertiser-controller', 'accounts-add-or-edit-brand-controller', 'accounts-add-or-edit-controller',
    'admin-account-service'],
    function (angularAMD) {
    'use strict';

    angularAMD.controller('AdminUsersController', ['$scope', '$rootScope', '$modal', '$compile', '$filter', 'constants', 'adminAccountsService', 'momentService', 'loginModel',
        'vistoconfig', 'utils', 'pageLoad',
        function ($scope, $rootScope, $modal, $compile, $filter, constants, adminAccountsService, momentService, loginModel, vistoconfig, utils, pageLoad) {
            var _curCtrl = this,
                winHeight = $(window).height();

            console.log('ADMIN USERS controller is loaded!');
            // Hide page loader when the page is loaded
            pageLoad.hidePageLoader();

            _curCtrl.clientId = vistoconfig.getSelectedAccountId();
            _curCtrl.masterClientId = vistoconfig.getMasterClientId();

            _curCtrl.verifyInput = function () {
                var ret = true;

                if ($scope.advertiserCodeExist) {
                   return false;
                }

                if (!$scope.advertiserName || $scope.advertiserName.trim() === '') {
                    $rootScope.setErrAlertMessage(constants.ADVERTISER_FEILD_EMPTY);
                    ret = false;
                }

                return ret;
            };

            _curCtrl.getAdvertiserCode = function () {
                if ($scope.advertiserName) {
                    adminAccountsService
                        .getUserAdvertiserCode($scope.advertiserName)
                        .then(function (result) {
                            var res;

                            if (result.status === 'OK' || result.status === 'success') {
                                res = result.data.data;

                                if (res.length) {
                                    $scope.codeList = res;
                                }
                            }
                        }, function () {
                        });
                }
            };

            $('.each_nav_link').removeClass('active_tab');
            $('#admin_nav_link').addClass('active_tab');

            // Responsive Height
            $('.table-responsive .tbody').css('min-height', winHeight - 380);

            $scope.advertisersData = [];
            $scope.isEditAdvertiser = false;

            $scope.fetchAllAdvertisers = function () {
                $scope.loadAdvertiserList = true;

                adminAccountsService
                    .getUserAdvertiser(_curCtrl.masterClientId)
                    .then(function (res) {
                        $scope.loadAdvertiserList = false;

                        if ((res.status === 'OK' || res.status === 'success') && res.data.data.length) {
                            $scope.advertisersData = res.data.data;
                            _curCtrl.advertisersData = $scope.advertisersData;

                            _.each($scope.advertisersData, function (item, i) {
                                $scope.advertisersData[i].createdAt =
                                    momentService.newMoment($scope.advertisersData[i].createdAt).format('YYYY-MM-DD');
                            });
                        }
                    });
            };

            $scope.fetchAllAdvertisers();

            $scope.createAdvertiser = function () {
                var nickname = $scope.nickname || $scope.advertiserName,
                    data,
                    code;

                if (!_curCtrl.verifyInput()) {
                    return;
                }

                if ($scope.isEditAdvertiser) {
                    data = $scope.editRequestBody;
                    data.name = $scope.advertiserName;
                    data.nickname = nickname;
                    data.ownerClientId = _curCtrl.masterClientId;

                    adminAccountsService
                        .updateAdvertiser(data)
                        .then(function (res) {
                            if (res.status === 'CREATED' || res.status === 'success') {
                                $scope.clearEdit();
                                $scope.fetchAllAdvertisers();
                                $rootScope.setErrAlertMessage(constants.SUCCESS_UPDATED_ADVERTISER, 0);
                                $scope.isEditAdvertiser = false;
                            } else {
                                $rootScope.setErrAlertMessage(constants.ERR_UPDATE_ADVERTISER);
                            }
                        }, function () {
                            $rootScope.setErrAlertMessage(constants.ERR_UPDATE_ADVERTISER);
                        });
                } else {
                    code = ($scope.setSelectedAdvertiserCode === 'Others') ?
                        $scope.customAdvertiserCode :
                        $scope.setSelectedAdvertiserCode;

                    if (!code) {
                        $rootScope.setErrAlertMessage(constants.CODE_FIELD_EMPTY);
                        return;
                    }
                    data = {
                        name: $scope.advertiserName,
                        code: code,
                        nickname:nickname,
                        ownerClientId: _curCtrl.masterClientId
                    };
                    adminAccountsService
                        .createAdvertiser(data)
                        .then(function (res) {
                            if (res.status === 'CREATED' || res.status === 'success') {
                                $scope.clearEdit();
                                $scope.fetchAllAdvertisers();
                                $rootScope.setErrAlertMessage(constants.SUCCESS_CREATE_ADVERTISER, 0);
                            } else {
                                $rootScope.setErrAlertMessage(utils.getResponseMsg(res));
                            }
                        }, function (err) {
                            $rootScope.setErrAlertMessage(err.message);
                        });
                }
            };

            $scope.editAdvertiser = function (obj) {
                $scope.isEditAdvertiser = obj.id;
                $scope.editRequestBody = obj;
                $scope.advertiserName = obj.name;
                $scope.setSelectedAdvertiserCode = obj.code;
                $scope.nickname = obj.nickname || obj.name;
                $('.setSelectedAdvertiserCode').addClass('disabled');
            };

            $scope.clearEdit = function () {
                $scope.isEditAdvertiser=false;
                $scope.advertiserName='';
                $scope.setSelectedAdvertiserCode = false;
                $scope.customAdvertiserCode = '';
                $scope.nickname = '';
                $('.setSelectedAdvertiserCode').removeClass('disabled');
            };

            $scope.leaveFocusAddAdvertiser = function () {
                _curCtrl.getAdvertiserCode();
            };

            $scope.selectAdvertiserCode = function (ev, code) {
                $scope.setSelectedAdvertiserCode = code;
            };

            $scope.leaveFocusCustomAdvertiserCode = function () {
                $scope.advertiserCodeExist = false;
                $scope.textConstants.ADVERTISER_CODE_EXIST = constants.ADVERTISER_CODE_EXIST;

                if ($scope.customAdvertiserCode) {
                    $scope.customAdvertiserCode = $scope.customAdvertiserCode.replace(/ /g, '');

                    if ($scope.customAdvertiserCode.replace(/ /g, '').length !== 5 ||
                        !(/^[a-zA-Z0-9_]*$/.test($scope.customAdvertiserCode))) {
                        $scope.textConstants.ADVERTISER_CODE_EXIST = constants.CODE_VERIFICATION;
                        $scope.advertiserCodeExist = true;
                        return;
                    }

                    adminAccountsService
                        .checkAdvertiserCodeExist($scope.customAdvertiserCode)
                        .then(function (result) {
                            if (result.status === 'OK' || result.status === 'success') {
                                $scope.advertiserCodeExist = result.data.data.isExists;
                            }
                        }, function () {
                        });
                }
            };

            $scope.keyUpCustomAdvertiserCode = function () {
                $scope.advertiserCodeExist = false;
            };

            // Search Clear
            $scope.searchHideInput = function () {
                $('.searchInputForm input').val('');
                $scope.advertisersData = _curCtrl.advertisersData;
            };

            $scope.searchFunc = function (e) {
                !$scope.usersSearch && ($scope.advertisersData = _curCtrl.advertisersData);

                if (!e || e.keyCode === 13) {
                    $scope.advertisersData = $filter('filter')(_curCtrl.advertisersData, $scope.usersSearch);
                }
            };

            $scope.$watch('advertisersData', function () {
                $scope.advertisersTotal = _.size($scope.advertisersData);
            });

            $('html').click(function (e) {
                if ($(e.target).closest('.searchInput').length === 0) {
                    $scope.searchHideInput();
                }
            });
        }
    ]);
});
