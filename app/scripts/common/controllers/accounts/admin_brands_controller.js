var angObj = angObj || {};

define(['angularAMD', '../../services/constants_service', 'workflow/services/account_service', 'common/moment_utils',
    'login/login_model', 'common/utils',
    'common/controllers/accounts/accounts_add_or_edit_advertiser_controller',
    'common/controllers/accounts/accounts_add_or_edit_brand_controller',
    'common/controllers/accounts/accounts_add_or_edit_controller' ], function (angularAMD) {
    'use strict';

    angularAMD.controller('AdminAdvertisersController', function ($scope, $rootScope, $modal, $compile, $filter,
                                                                  constants, accountsService, momentService,
                                                                  loginModel, utils) {
        var _curCtrl = this,
            winHeight = $(window).height();
        _curCtrl.clientId = loginModel.getSelectedClient().id;

        $('.each_nav_link').removeClass('active_tab');
        $('#admin_nav_link').addClass('active_tab');
        $scope.brandsData = [];

        $('.table-responsive .tbody').css('min-height', winHeight - 380);

        $scope.fetchAllBrands = function () {
            $scope.loadBrandList = true;
            accountsService
                .getUserBrands(_curCtrl.clientId)
                .then(function (res) {
                    $scope.loadBrandList = false;

                    if ((res.status === 'OK' || res.status === 'success') && res.data.data.length) {
                        $scope.brandsData = res.data.data;
                        _curCtrl.brandsData = $scope.brandsData;

                        _.each($scope.brandsData, function (item, i) {
                            $scope.brandsData[i].createdAt =
                                momentService.newMoment($scope.brandsData[i].createdAt).format('YYYY-MM-DD');
                        });
                    }
                });
        };

        $scope.fetchAllBrands();

        $scope.createBrand = function () {
            var data;

            if (!$scope.brandName || $scope.brandName.trim() === '') {
                $rootScope.setErrAlertMessage(constants.BRAND_FEILD_EMPTY);
                return;
            }

            if ($scope.isEditBrand) {
                data = $scope.editRequestBody;
                data.name = $scope.brandName;
                data.ownerClientId = _curCtrl.clientId;

                accountsService
                    .updateBrand(data)
                    .then(function (res) {
                        if (res.status === 'CREATED' || res.status === 'success') {
                            $scope.brandName = '';
                            $scope.fetchAllBrands();
                            $rootScope.setErrAlertMessage(constants.SUCCESS_CREATE_BRAND, 0);
                        } else {
                            $rootScope.setErrAlertMessage(utils.getResponseMsg(res));
                        }
                    }, function (err) {
                        $rootScope.setErrAlertMessage(err.message);
                    });
            } else {
                data = {
                    name: $scope.brandName,
                    ownerClientId: _curCtrl.clientId
                }
                accountsService
                    .createBrand(data)
                    .then(function (res) {
                        if (res.status === 'CREATED' || res.status === 'success') {
                            $scope.brandName = '';
                            $scope.fetchAllBrands();
                            $rootScope.setErrAlertMessage(constants.SUCCESS_CREATE_BRAND, 0);
                        } else {
                            $rootScope.setErrAlertMessage(utils.getResponseMsg(res));
                        }
                    }, function (err) {
                        $rootScope.setErrAlertMessage(err.message);
                    });
            }
        };

        $scope.editBrand = function (obj) {
            $scope.isEditBrand = obj.id;
            $scope.editRequestBody = obj;
            $scope.brandName = obj.name;
        };

        // Search Clear
        $scope.searchHideInput = function () {
            $('.searchInputForm input').val('');
            $scope.brandsData = _curCtrl.brandsData;
        };

        $scope.searchFunc = function (e) {
            !$scope.usersSearch && ($scope.brandsData = _curCtrl.brandsData);

            if (!e || e.keyCode === 13) {
                $scope.brandsData = $filter('filter')(_curCtrl.brandsData, $scope.usersSearch);

            }
        };

        $scope.$watch('brandsData', function () {
            $scope.brandsTotal = _.size($scope.brandsData);
        });

        $('html').click(function (e) {
            if ($(e.target).closest('.searchInput').length === 0) {
                $scope.searchHideInput();
            }
        });
    });
});
