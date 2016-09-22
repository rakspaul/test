define(['angularAMD', 'common-utils', 'accounts-add-or-edit-advertiser-controller', 'accounts-add-or-edit-brand-controller', 'accounts-add-or-edit-controller',
    'admin-account-service'],
    function (angularAMD) {
    'use strict';

    angularAMD.controller('AdminAdvertisersController', ['$scope', '$rootScope', '$modal', '$compile', '$filter', 'constants', 'adminAccountsService', 'momentService',
        'loginModel', 'vistoconfig', 'utils', 'pageLoad',
        function ($scope, $rootScope, $modal, $compile, $filter, constants, adminAccountsService, momentService, loginModel, vistoconfig, utils, pageLoad) {
            var _curCtrl = this,
                winHeight = $(window).height();

            $scope.fetchAllBrands = function () {
                $scope.loadBrandList = true;
                adminAccountsService
                    .getUserBrands(_curCtrl.masterClientId)
                    .then(function (res) {
                        $scope.loadBrandList = false;

                        if ((res.status === 'OK' || res.status === 'success') && res.data.data.length) {
                            $scope.brandsData = res.data.data;
                            _curCtrl.brandsData = $scope.brandsData;

                            _.each($scope.brandsData, function (item, i) {
                                $scope.brandsData[i].createdAt = momentService.newMoment($scope.brandsData[i].createdAt).format('YYYY-MM-DD');
                            });
                        }
                    });
            };

            console.log('ADMIN BRANDS controller is loaded!');
            // Hide page loader when the page is loaded
            pageLoad.hidePageLoader();

            _curCtrl.clientId = vistoconfig.getSelectedAccountId();
            _curCtrl.masterClientId = vistoconfig.getMasterClientId();

            $('.each_nav_link').removeClass('active_tab');
            $('#admin_nav_link').addClass('active_tab');
            $scope.brandsData = [];

            $('.table-responsive .tbody').css('min-height', winHeight - 380);

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
                    data.ownerClientId = _curCtrl.masterClientId;

                    adminAccountsService
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
                        ownerClientId: _curCtrl.masterClientId
                    };
                    adminAccountsService
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
        }
    ]);
});
