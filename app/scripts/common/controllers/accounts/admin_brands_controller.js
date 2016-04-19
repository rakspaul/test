var angObj = angObj || {};
define(['angularAMD', '../../services/constants_service', 'workflow/services/account_service', 'common/moment_utils',
        'login/login_model',
        'common/controllers/accounts/accounts_add_or_edit_advertiser_controller',
        'common/controllers/accounts/accounts_add_or_edit_brand_controller', 'common/controllers/accounts/accounts_add_or_edit_controller' ],
    function (angularAMD) {
        angularAMD.controller('AdminAdvertisersController', function ($scope, $rootScope, $modal, $compile,
            constants, accountsService, momentService,
            loginModel) {

            $scope.brandsData = [];

            $scope.fetchAllBrands = function(){
                console.log("fetchAllAdvertisers......");
                accountsService.getUserBrands().then(function(res){
                    console.log("brandList....",res);
                    if ((res.status === 'OK' || res.status === 'success') && res.data.data.length) {
                        $scope.brandsData = res.data.data;
                        _.each($scope.brandsData, function(item, i){
                            $scope.brandsData[i].createdAt = momentService.newMoment($scope.brandsData[i].createdAt).format('YYYY-MM-DD');
                        })
                    }
                });
            };
            $scope.fetchAllBrands();

            $scope.createBrand = function(){
                accountsService.createBrand({name:$scope.brandName}).then(function(res){
                    if (res.status === 'CREATED' || res.status === 'success') {
                        $scope.brandName = "";
                        $scope.fetchAllBrands();
                        $rootScope.setErrAlertMessage(constants.SUCCESS_CREATE_BRAND,0);
                    }else{
                        $rootScope.setErrAlertMessage(res.data.message);
                        return;
                    }
                },function(err){
                    $rootScope.setErrAlertMessage(err.message);
                    return;
                    //$scope.fetchAllAdvertisers();
                });
            }
        });
    });
