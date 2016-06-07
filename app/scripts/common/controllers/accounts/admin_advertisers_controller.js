var angObj = angObj || {};
define(['angularAMD', '../../services/constants_service', 'workflow/services/account_service', 'common/moment_utils',
        'login/login_model',
        'common/controllers/accounts/accounts_add_or_edit_advertiser_controller',
        'common/controllers/accounts/accounts_add_or_edit_brand_controller', 'common/controllers/accounts/accounts_add_or_edit_controller' ],
    function (angularAMD) {
        angularAMD.controller('AdminUsersController', function ($scope, $rootScope, $modal, $compile,
            constants, accountsService, momentService,
            loginModel) {
            $(".each_nav_link").removeClass("active_tab");
            $("#admin_nav_link").addClass("active_tab");

            //Responsive Height
            var winHeight = $(window).height();
            $(".table-responsive .tbody").css("min-height", winHeight - 380);

            $scope.advertisersData = [];
            $scope.isEditAdvertiser = false;
            $scope.fetchAllAdvertisers = function(){
                $scope.loadAdvertiserList = true;
                accountsService.getUserAdvertiser().then(function(res){
                    $scope.loadAdvertiserList = false;
                    if ((res.status === 'OK' || res.status === 'success') && res.data.data.length) {
                        $scope.advertisersData = res.data.data;
                        $scope.advertisersTotal = _.size(res.data.data);
                        _.each($scope.advertisersData, function(item, i){
                            $scope.advertisersData[i].createdAt = momentService.newMoment($scope.advertisersData[i].createdAt).format('YYYY-MM-DD');
                        })
                    }
                });
            };
            $scope.fetchAllAdvertisers();

            $scope.createAdvertiser = function(){
                if(!$scope.advertiserName || $scope.advertiserName.trim() == ""){
                    $rootScope.setErrAlertMessage(constants.ADVERTISER_FEILD_EMPTY);
                    return;
                }
                if($scope.isEditAdvertiser){
                    var requestBody = $scope.editRequestBody;
                    requestBody.name = $scope.advertiserName;
                    accountsService.updateAdvertiser(requestBody.id, requestBody).then(function (res) {
                        if (res.status === 'CREATED' || res.status === 'success') {
                            $scope.advertiserName = "";
                            $scope.fetchAllAdvertisers();
                            $rootScope.setErrAlertMessage(constants.SUCCESS_UPDATED_ADVERTISER, 0);
                            $scope.isEditAdvertiser = false;
                        } else {
                            $rootScope.setErrAlertMessage(constants.ERR_UPDATE_ADVERTISER);
                            return;
                        }
                    }, function (err) {
                        $rootScope.setErrAlertMessage(constants.ERR_UPDATE_ADVERTISER);
                        return;
                    });
                }else {
                    accountsService.createAdvertiser({name: $scope.advertiserName}).then(function (res) {
                        if (res.status === 'CREATED' || res.status === 'success') {
                            $scope.advertiserName = "";
                            $scope.fetchAllAdvertisers();
                            $rootScope.setErrAlertMessage(constants.SUCCESS_CREATE_ADVERTISER, 0);
                        } else {
                            $rootScope.setErrAlertMessage(res.data.message);
                            return;
                        }
                    }, function (err) {
                        $rootScope.setErrAlertMessage(err.message);
                        return;
                    });
                }
            }

            $scope.editAdvertiser = function(obj){
                $scope.isEditAdvertiser = obj.id;
                $scope.editRequestBody = obj;
                $scope.advertiserName = obj.name;
            }

            //Search Clear
            $scope.searchHideInput = function (evt) {
                evt && $(evt.target).hide();
                $('.searchInputForm input').val('');
            };

            $('html').click(function(e) {
                if ($(e.target).closest('.searchInput').length === 0) {
                    $scope.searchHideInput();
                }
            });
        });
    });
