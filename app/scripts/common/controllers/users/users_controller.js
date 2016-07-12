define(['angularAMD', '../../services/constants_service', // jshint ignore:line
    'workflow/services/account_service', 'common/controllers/users/users_add_or_edit_controller',
    'libs/modernizr-custom', 'libs/dlmenu'], function (angularAMD) {
    'use strict';

    angularAMD.controller('UsersController', function ($scope,$rootScope,$timeout,$filter,
                                                       constants,accountsService) {
        var _curCtrl = this,
            winHeight = $(window).height(),

            usersList = {
                getUsers:function () {
                    $scope.loadUserList = true;
                    accountsService.getUsers().then(function (res) {
                        $scope.loadUserList = false;
                        $scope.UsersData.users= res.data.data;
                        _curCtrl.UsersData = $scope.UsersData.users;
                    });
                }
            };

        $scope.textConstants = constants;
        $scope.UsersData={};
        $scope.userConsoleFormDetails={};

        $('.each_nav_link').removeClass('active_tab');
        $('#admin_nav_link').addClass('active_tab');

        //Responsive Height
        $('.table-responsive .tbody').css('min-height', winHeight - 330);

        //Add or Edit Pop up for User
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
                case 1: return 'Super Admin';
                case 2: return 'Account Admin';
                case 3: return 'Advertiser Admin';
                case 4: return 'General User';
                default : return 'Not Available';
            }
        };

        $scope.searchFunc = function (e) {
            !$scope.usersSearch && ($scope.UsersData.users = _curCtrl.UsersData);

            if (!e || e.keyCode === 13) {
                $scope.UsersData.users = $filter('filter')(_curCtrl.UsersData, $scope.usersSearch);
            }
        };

        $scope.$watch('UsersData.users', function () {
            $scope.userTotal = _.size($scope.UsersData.users); // jshint ignore:line
        });

        $('html').click(function (e) {
            if ($(e.target).closest('.searchInput').length === 0) {
                $scope.searchHideInput();
            }
        });
    });
});
