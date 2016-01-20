var angObj = angObj || {};

(function () {
    'use strict';

    angObj.controller('AccountsController', function ($scope, $rootScope, $window, $routeParams, constants, accountsService, 
        $timeout, utils, $location , $modal) {
        $('.main_navigation')
            .find('.active')
            .removeClass('active')
            .end()
            .find('#creative_nav_link')
            .addClass('active');
        $scope.textConstants = constants;
        $scope.clientsDetails = [];
        $scope.advertiserName = '';
        $scope.mode = 'create';
        $scope.client = '';
        $scope.brand = '';
        $scope.allAdvertiser = [];
        $scope.allBrands = [];
        $scope.currency = [];
        // this is the advertiser selected from dropdown during new advertiser creation
        $scope.selectedAdvertiserId = '';
        $scope.selectedBrandId = '';
        $scope.dropdownCss = {
            display: 'none',
            'max-height': '100px',
            overflow: 'scroll',
            top: '60px',
            left: '0'
        };

        $scope.resetFlashMessage = function () {
            $rootScope.setErrAlertMessage('', 0);
        };

        $scope.show_advertisers = function (event, clientId) {
            var elem = $(event.target);

            elem
                .closest('.each-account-details')
                .find('.advertiser-list')
                .toggle() ;
            elem
                .closest('.each-account-details')
                .find('.particular-account-box')
                .toggleClass('open');
            $scope.fetchAllAdvertisers(clientId);
        };

        $scope.show_advertisers_resp_brands = function (event, client, brand) {
            var elem = $(event.target);

            elem
                .closest('.each-advertiser')
                .find('.advertiser-resp-brands-list')
                .toggle() ;
            $scope.fetchBrands(client,brand);
        };

        $scope.show_edit = function (type) {
            $('.edit-container').hide();
            $('#'+ type +'-edit-container').toggle('slide', { direction: 'right' }, 500);
        };

        $scope.fetchAllClients = function () {
            accountsService
                .getClients()
                .then(function (res) {
                    $scope.clientsDetails = res.data.data[0].children;
                });
        };

        $scope.fetchAllClients();

        $scope.fetchAllAdvertisers = function (clientId) {
               accountsService
                   .getClientsAdvertisers(clientId)
                   .then(function (res) {
                       var index = _.findIndex($scope.clientsDetails, function (item) {
                           return item.id === clientId;
                       });
                       $scope.clientsDetails[index]['advertisement'] = [];
                       $scope.clientsDetails[index]['advertisement'] = res.data.data;
                   });
        };

        $scope.fetchBrands = function (clientId, advertiserId) {
            if (advertiserId !== -1) {
                accountsService
                    .getAdvertisersBrand(clientId, advertiserId).
                    then(function (res) {
                        var clientIndex = _.findIndex($scope.clientsDetails, function (item) {
                                return item.id === clientId;
                            }),
                            advIndex = _.findIndex($scope.clientsDetails[clientIndex].advertisement, function (item) {
                                return item.id === advertiserId;
                            });

                        $scope.clientsDetails[clientIndex].advertisement[advIndex].brand = res.data.data;
                    });
            }
        };

        //Add or Edit Pop up for Advertiser
        $scope.AddOrEditAdvertiserModal = function (advObj, mode, client) {
            var $modalInstance;

            $scope.mode = mode;
            $scope.client = client;
            if (mode === 'edit') {
                accountsService.setToBeEditedAdvertiser(advObj);
                $scope.advertiserName = advObj.name;
            } else {
                accountsService
                    .getAllAdvertisers()
                    .then(function (result) {
                        $scope.allAdvertiser = result.data.data;
                    });
            }
            $modalInstance = $modal.open({
                templateUrl: assets.html_accounts_add_or_edit_advertiser,
                controller: 'AccountsAddOrEditAdvertiser',
                scope: $scope,
                windowClass: 'edit-dialog',
                resolve: {}
            });
        };

        //Add or Edit Pop up for Brand
        $scope.AddOrEditBrandModal = function (advObj, mode, client, brand) {
            var $modalInstance;
            
            $scope.mode = mode;
            $scope.client = client;
            $scope.brandName = brand.name;
            $scope.advertiser = advObj;
            if (mode === 'edit') {
                accountsService.setToBeEditedBrand(brand);
                $scope.brandName = brand.name;
            }
            else{
                accountsService
                    .getAllBrands()
                    .then(function (result) {
                        $scope.allBrands = result.data.data;
                    });
            }
            $modalInstance = $modal.open({
                templateUrl: assets.html_accounts_add_or_edit_brand,
                controller: 'AccountsAddOrEditBrand',
                scope: $scope,
                windowClass: 'edit-dialog',
                resolve: {}
            });
        };

        $scope.resetBrandAdvertiserAfterEdit = function (mode) {
            $scope.mode = 'create';
            $scope.client = '';
            $scope.brand = '';
            $scope.advertiser = '';
            $scope.client = '';
            $scope.selectedAdvertiserId = '';
            $scope.advertiserName = '';
            $scope.brandName = '';
            $scope.clientName = '';
            $scope.selectedBrandId = '';
            $scope.allBrands = [];
            $scope.allAdvertiser = [];
            $scope.dropdownCss.display = 'none';
            accountsService.setToBeEditedAdvertiser(null);
            accountsService.setToBeEditedBrand(null);
            accountsService.setToBeEditedClient(null)
        };

        //Add or Edit Pop up for Account
        $scope.AddOrEditAccountModal = function (mode, clientObj) {
            var $modalInstance;

            $scope.mode = mode;
            accountsService
                .getAllCurrency()
                .then(function (result) {
                    $scope.currency = result.data.data;
                });

            accountsService.setToBeEditedClient(clientObj);
            $scope.clientObj = clientObj;
            $modalInstance = $modal.open({
                templateUrl: assets.html_accounts_add_or_edit,
                controller: 'AccountsAddOrEdit',
                scope: $scope,
                windowClass: 'edit-dialog',
                resolve: {}
            });
        };

        //create advertiser
        $scope.selectAdvertiser = function (advertiser) {
            $scope.dropdownCss.display = 'none';
            $scope.advertiserName = advertiser.name;
            $scope.selectedAdvertiserId = advertiser.id;
            $('#advertiserNameInp').val($scope.advertiserName);
        };

        //create brand
        $scope.selectBrand = function (brand) {
            $scope.dropdownCss.display = 'none';
            $scope.brandName = brand.name;
            $scope.selectedBrandId = brand.id;
            $('#brandNameInp').val($scope.brandName);
        };

        $scope.showDropdown = function () {
            $scope.advertiserName = '';
            $scope.selectedAdvertiserId = '';
            $scope.brandName = '';
            $scope.selectedBrandId = '';
            $scope.dropdownCss.display = 'block';
            $('.account_name_list').show();
        };
    });
})();
