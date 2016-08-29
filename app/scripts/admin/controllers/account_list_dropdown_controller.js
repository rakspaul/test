define(['angularAMD', 'ng-update-hidden-dropdown', 'admin-account-service'],
    function (angularAMD) {

    angularAMD.controller('AccountListDropdownController', ['$scope', '$rootScope', '$compile', '$q', 'constants', 'adminAccountsService',
        function ($scope, $rootScope, $compile, $q, constants, adminAccountsService) {

        $scope.initddl = function(){

            var ddlIndex = Math.floor(Math.random() * 1000);

            $scope.loadingClientDropDown = false;
            $scope.ddlID = 'accountDropDown_1';
            $scope.clientddlID = 'clientDropdown_' + ddlIndex + '_';

            $scope.$parent.$watch('userConsoleFormDetails.homeClientId', function(){
                $scope.currentClientName = $scope.$parent.userConsoleFormDetails.homeClientName;
            });
        };

        $scope.openAccountsDropdown = function (event) {
             $(event.target).closest('.dropdown').find('.dropdown-menu').show();
        };

        $scope.selectClientOption = function (id, name) {

                $scope.$parent.userConsoleFormDetails.homeClientId = id;
                $scope.$parent.userConsoleFormDetails.homeClientName = name;

                $('#' +  $scope.ddlID + ' .clientDropdownCnt , .childTier').hide();

        };

        $scope.goToParentClientList = function (parentContianerId, clientId) {
            var sel =  '#' + $scope.clientddlID;

            $(sel+clientId).hide();
            $(sel+parentContianerId).show();
        };

        $scope.getSubClientList = function (clientId, name, parentContianerId) {

            var sel = '#' + $scope.clientddlID;
            var accountIndex = 0;

            if ($(sel + clientId).length) {
                $(sel + parentContianerId).hide();
                $(sel + clientId).show();
                return;
            }

            $scope.loadingClientDropDown = true;

            adminAccountsService
                .getSubClients(clientId)
                .then(function (res) {
                    var result = res.data.data;

                    $scope.loadingClientDropDown = false;

                    if ((res.status === 'OK' || res.status === 'success') && result.length) {
                        $(sel+parentContianerId).hide();
                        $scope.subClientListData[clientId] = result;

                        angular
                            .element(document.getElementById($scope.ddlID))
                            .append($compile(
                                '<div class="childTier" id="' + $scope.clientddlID  + clientId +
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


        }]);
    });
