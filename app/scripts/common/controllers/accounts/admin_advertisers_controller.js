var angObj = angObj || {};
define(['angularAMD', '../../services/constants_service', 'workflow/services/account_service', 'common/moment_utils',
        'login/login_model',
        'common/controllers/accounts/accounts_add_or_edit_advertiser_controller',
        'common/controllers/accounts/accounts_add_or_edit_brand_controller', 'common/controllers/accounts/accounts_add_or_edit_controller' ],
    function (angularAMD) {
    angularAMD.controller('AdminUsersController', function ($scope, $rootScope, $modal, $compile,
        constants, accountsService, momentService,
        loginModel) {

        $scope.advertisersData = [];

        $scope.fetchAllAdvertisers = function(){
            console.log("fetchAllAdvertisers......");
            accountsService.getUserAdvertiser().then(function(res){
               console.log("brandList....",res);
                if ((res.status === 'OK' || res.status === 'success') && res.data.data.length) {
                    $scope.advertisersData = res.data.data;
                    _.each($scope.advertisersData, function(item, i){
                        $scope.advertisersData[i].createdAt = momentService.newMoment($scope.advertisersData[i].createdAt).format('YYYY-MM-DD');
                    })
                }
            });
        };
        $scope.fetchAllAdvertisers();

        $scope.createAdvertiser = function(){
            accountsService.createAdvertiser({name:$scope.advertiserName}).then(function(res){
                if (res.status === 'CREATED' || res.status === 'success') {
                    $scope.advertiserName = "";
                    $scope.fetchAllAdvertisers();
                    $rootScope.setErrAlertMessage(constants.SUCCESS_CREATE_ADVERTISER,0);
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
