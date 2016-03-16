define(['angularAMD', '../../services/constants_service', 'workflow/services/account_service','common/controllers/users/users_add_or_edit_controller'],function (angularAMD) {
    'use strict';
    angularAMD.controller('UsersController', function ($scope,$rootScope,$timeout,constants,accountsService) {
        $scope.textConstants = constants;
        $scope.UsersData={};
        $scope.userConsoleFormDetails={};
        
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
            $('.user-list, .users-creation-page .heading').fadeOut();
            $('.edit-dialog').fadeIn();
            
            $scope.isEdit = false;
            
            if(mode == 'edit'){
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
                }, 2000)


                //}
            }
        };
        
        $scope.closeForm = function () {
            $('.user-list, .users-creation-page .heading').fadeIn();
            $('.edit-dialog').fadeOut();
        }
        
        //DDL Tier Parent, Child
        (function() {
            var menuEl = document.getElementById('ml-menu'),
                mlmenu = new MLMenu(menuEl, {
                    // breadcrumbsCtrl : true, // show breadcrumbs
                    // initialBreadcrumb : 'all', // initial breadcrumb text
                    backCtrl : false, // show back button
                    // itemsDelayInterval : 60, // delay between each menu item sliding animation
                    onItemClick: loadDummyData // callback: item that doesn´t have a submenu gets clicked - onItemClick([event], [inner HTML of the clicked item])
                });
    
            // mobile menu toggle
            var openMenuCtrl = document.querySelector('.action--open'),
                closeMenuCtrl = document.querySelector('.action--close');
    
            openMenuCtrl.addEventListener('click', openMenu);
            closeMenuCtrl.addEventListener('click', closeMenu);
    
            function openMenu() {
                classie.add(menuEl, 'menu--open');
            }
    
            function closeMenu() {
                classie.remove(menuEl, 'menu--open');
            }
    
            // simulate grid content loading
            var gridWrapper = document.querySelector('.content');
    
            function loadDummyData(ev, itemName) {
                ev.preventDefault();
    
                closeMenu();
                gridWrapper.innerHTML = '';
                classie.add(gridWrapper, 'content--loading');
                setTimeout(function() {
                    classie.remove(gridWrapper, 'content--loading');
                    gridWrapper.innerHTML = '<ul class="products">' + dummyData[itemName] + '<ul>';
                }, 700);
            }
        })();

        var usersList = {
            getUsers:function(){
                accountsService.getUsers().then(function(res) {
                    $scope.UsersData['users']= res.data.data;
                });
            }
        };
        usersList.getUsers();
        $rootScope.$on('refreshUserList',function(){
            console.log('user list refresh');
            usersList.getUsers();
        });
        
    });

});
