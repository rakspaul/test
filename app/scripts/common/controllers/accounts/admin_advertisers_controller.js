var angObj = angObj || {};

define(['angularAMD', '../../services/constants_service', 'workflow/services/account_service', 'common/moment_utils',
    'login/login_model', 'common/controllers/accounts/accounts_add_or_edit_advertiser_controller',
    'common/controllers/accounts/accounts_add_or_edit_brand_controller',
    'common/controllers/accounts/accounts_add_or_edit_controller' ], function (angularAMD) {
    'use strict';

    angularAMD.controller('AdminUsersController', function ($scope, $rootScope, $modal, $compile, $filter,
                                                                constants, accountsService, momentService) {
        var _curCtrl = this,
            winHeight = $(window).height();

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
                accountsService
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

        //Responsive Height
        $('.table-responsive .tbody').css('min-height', winHeight - 380);

        $scope.advertisersData = [];
        $scope.isEditAdvertiser = false;

        $scope.fetchAllAdvertisers = function () {
            $scope.loadAdvertiserList = true;

            accountsService
                .getUserAdvertiser()
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
                requestBody,
                code;

            if (!_curCtrl.verifyInput()) {
                return;
            }

            if ($scope.isEditAdvertiser) {
                requestBody = $scope.editRequestBody;
                requestBody.name = $scope.advertiserName;
                requestBody.nickname = nickname;

                accountsService
                    .updateAdvertiser(requestBody.id, requestBody)
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

                accountsService
                    .createAdvertiser({
                        name: $scope.advertiserName,
                        code: code, nickname:nickname
                    })
                    .then(function (res) {
                        if (res.status === 'CREATED' || res.status === 'success') {
                            $scope.clearEdit();
                            $scope.fetchAllAdvertisers();
                            $rootScope.setErrAlertMessage(constants.SUCCESS_CREATE_ADVERTISER, 0);
                        } else {
                            $rootScope.setErrAlertMessage(res.data.message);
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

                accountsService
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

        //Search Clear
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
    });
});
