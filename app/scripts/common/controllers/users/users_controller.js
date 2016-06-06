define(['angularAMD', '../../services/constants_service', 'workflow/services/account_service','common/controllers/users/users_add_or_edit_controller','libs/modernizr-custom', 'libs/dlmenu'],function (angularAMD) {
    'use strict';
    angularAMD.controller('UsersController', function ($scope,$rootScope,$timeout,constants,accountsService) {
        $scope.textConstants = constants;
        $scope.UsersData={};
        $scope.userConsoleFormDetails={};
        $(".each_nav_link").removeClass("active_tab");
        $("#admin_nav_link").addClass("active_tab");
        
        //Responsive Height
        var winHeight = $(window).height();
        $(".table-responsive .tbody").css("min-height", winHeight - 330);

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

            $(".btn-group").addClass("toggleBtn");

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

//        $scope.userConsoleFormDetails, $scope.closeForm = function () {
//            $('.user-list, .users-creation-page .heading').fadeIn();
//            $('.edit-dialog').fadeOut();
//            setTimeout(function(){
//                if($("#cmn-toggle-1").is(':checked')){
//                    $("#cmn-toggle-1").trigger('click');
//                }
//                if($("#userState").is(':checked')){
//                    $("#userState").trigger('click');
//                }
//            },25);
//        }

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

        //Search Clear
        $(".searchInputForm input").on("input", function() {
            if($('.searchInputForm input').val()) {
              $(".searchClearInputBtn").show();
            } else {
              $(".searchClearInputBtn").hide(); 
            }
        });
        
        $scope.searchHideInput = function () {
            $('.searchInputForm input').val('');
        };
        
        $scope.getRoleText = function(roleId){
            switch(roleId){
                case 1: return "Super Admin";  break;
                case 2: return "Account Admin"; break;
                case 3: return "Advertiser Admin"; break;
                case 4: return "General User"; break;
                default : return "Not Available"
            }
        }
        $('html').click(function(e) {
            if ($(e.target).closest('.searchInput').length === 0) {
                $scope.searchHideInput();
            }
        });

    });

});