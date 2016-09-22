define(['angularAMD', 'users-add-or-edit-controller', 'admin-account-service', 'modernizr-custom', 'dlmenu'],
    function (angularAMD) {
    'use strict';

    angularAMD.controller('UsersController', ['$scope', '$rootScope', '$timeout', '$filter', '$modal', 'constants', 'adminAccountsService', 'pageLoad',
        function ($scope,$rootScope, $timeout, $filter, $modal, constants, adminAccountsService, pageLoad) {
            var _curCtrl = this,
                winHeight = $(window).height(),

                usersList = {
                    getUsers:function () {
                        $scope.loadUserList = true;
                        adminAccountsService.getUsers().then(function (res) {
                            $scope.loadUserList = false;
                            $scope.UsersData.users= res.data.data;
                            _curCtrl.UsersData = $scope.UsersData.users;
                        });
                    }
                };

            console.log('ADMIN USERS controller is loaded!');
            // Hide page loader when the page is loaded
            pageLoad.hidePageLoader();

            $scope.textConstants = constants;
            $scope.UsersData={};
            $scope.userConsoleFormDetails={};

            $('.each_nav_link').removeClass('active_tab');
            $('#admin_nav_link').addClass('active_tab');

            // Responsive Height
            $('.table-responsive .tbody').css('min-height', winHeight - 330);

            // Add or Edit Pop up for User
            $scope.AddOrEditUserModal = function (mode ,userObj) {
                $('.btn-group').addClass('toggleBtn');

                $scope.isEdit = false;

                if (mode === 'edit') {
                    $('#maskWindow').show();
                    $scope.isEdit = true;

                    $timeout(function () {
                        $rootScope.$broadcast('permissionsForUsers', [userObj]);
                    }, 2000);
                } else {
                    $timeout(function () {
                        $rootScope.$broadcast('permissionsForUsers');
                    }, 2000);
                }
            };

            // Change Password for User
            $scope.changePassword = function (user) {


                $modal.open({
                    templateUrl: assets.html_change_password,
                    controller: 'changePasswordController',
                    scope: $scope,
                    windowClass: 'delete-dialog',
                    resolve: {
                      userObj: function () {
                        return user;
                      }
                    }
                });
            };


            usersList.getUsers();

            $rootScope.$on('refreshUserList',function () {
                usersList.getUsers();
            });

            // Search Clear
            $scope.searchHideInput = function () {
                $('.searchInputForm input').val('');
                $scope.UsersData.users = _curCtrl.UsersData;
            };

            $scope.getRoleText = function (roleId) {
                switch (roleId) {
                    case 1:
                        return 'Super Admin';
                    case 2:
                        return 'Account Admin';
                    case 3:
                        return 'Advertiser Admin';
                    case 4:
                        return 'General User';
                    default:
                        return 'Not Available';
                }
            };

            $scope.searchFunc = function (e) {
                !$scope.usersSearch && ($scope.UsersData.users = _curCtrl.UsersData);

                if (!e || e.keyCode === 13) {
                    $scope.UsersData.users = $filter('filter')(_curCtrl.UsersData, $scope.usersSearch);
                }
            };

            $scope.$watch('UsersData.users', function () {
                $scope.userTotal = _.size($scope.UsersData.users);
            });

            $('html').click(function (e) {
                if ($(e.target).closest('.searchInput').length === 0) {
                    $scope.searchHideInput();
                }
            });
        }
    ]);
});
