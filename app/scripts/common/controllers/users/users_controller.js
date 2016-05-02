define(['angularAMD', '../../services/constants_service', 'workflow/services/account_service','common/controllers/users/users_add_or_edit_controller','libs/modernizr-custom', 'libs/dlmenu'],function (angularAMD) {
    'use strict';
    angularAMD.controller('UsersController', function ($scope,$rootScope,$timeout,constants,accountsService) {
        $scope.textConstants = constants;
        $scope.UsersData={};
        $scope.userConsoleFormDetails={};
        $(".each_nav_link").removeClass("active_tab");
        $("#admin_nav_link").addClass("active_tab");

        //Add or Edit Pop up for User
        $scope.AddOrEditUserModal = function(mode,userObj) {

            //$timeout(function () {
            //    $rootScope.$broadcast('resetUserModal');
            //}, 500)

            //var $modalInstance = $modal.open({
            //    templateUrl: assets.html_users_add_or_edit,
            //    scope:$scope,
            //    windowClass: 'edit-dialog',
            //    controller: "UsersAddOrEdit"
            //});

            //$('.user-list').addClass('fadeOutLeft');
//            $('.user-list, .users-creation-page .heading').fadeOut();
//            $('.edit-dialog').fadeIn();

            $scope.isEdit = false;

            if(mode == 'edit'){
                $("#maskWindow").show();
                $scope.isEdit = true;
                //$scope.userConsoleFormDetails.email = userObj.email;
                //$scope.userConsoleFormDetails.firstName = userObj.firstName;
                //$scope.userConsoleFormDetails.lastName = userObj.lastName;
                ////$scope.userConsoleFormDetails.role_template_id = accountsService.getRoleName(userObj.role_template_id);
                ////$scope.userConsoleFormDetails.role_template_id = "Account_Admin";
                //$scope.userConsoleFormDetails.roleTemplateId = userObj.roleTemplateId;
                ////$scope.userConsoleFormDetails.firstName = userObj.firstName;
                //$scope.userConsoleFormDetails.password = userObj.password;
                //set permission set
                $timeout(function () {
                    $rootScope.$broadcast('permissionsForUsers',[userObj]);
                }, 2000);


                //}
            }else{
                $timeout(function () {
                    $rootScope.$broadcast('permissionsForUsers');
                }, 2000)
            }
        };

        $scope.userConsoleFormDetails, $scope.closeForm = function () {
            $('.user-list, .users-creation-page .heading').fadeIn();
            $('.edit-dialog').fadeOut();
            setTimeout(function(){
                if($("#cmn-toggle-1").is(':checked')){
                    $("#cmn-toggle-1").trigger('click');
                }
            },25);
        }

        var usersList = {
            getUsers:function(){
                $scope.loadUserList = true;
                accountsService.getUsers().then(function(res) {
                    $scope.loadUserList = false;
                    $scope.UsersData['users']= res.data.data;
                    $scope.userTotal = _.size(res.data.data);
                });
            }
        };
        usersList.getUsers();
        $rootScope.$on('refreshUserList',function(){
            usersList.getUsers();
        });

        //Search Hide / Show
        $scope.searchShowInput = function () {
            var searchInputForm = $('.searchInputForm');

            $('.searchInputBtn').hide();
            $('.searchInputBtnInline').show();
            searchInputForm.show();
            searchInputForm.animate({width: '400px'}, 'fast');
            setTimeout(function () {
                $('.searchClearInputBtn').fadeIn();
            }, 300);
        };

        $scope.searchHideInput = function () {
            $('.searchInputForm input').val('');
            $('.searchInputBtn').show();
            $('.searchClearInputBtn, .searchInputBtnInline').hide();
            $('.searchInputForm').animate({width: '34px'}, 'fast');
            setTimeout(function () {
                $('.searchInputForm').hide();
            }, 100);
        };

        $('html').click(function(e) {
            if ($(e.target).closest('.searchInput').length === 0) {
                $scope.searchHideInput();
            }
        });

    });

});