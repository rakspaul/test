var angObj = angObj || {};
define(['angularAMD', '../../services/constants_service', 'workflow/services/account_service', 'common/moment_utils',
        'login/login_model',
        'common/controllers/accounts/accounts_add_or_edit_advertiser_controller',
        'common/controllers/accounts/accounts_add_or_edit_brand_controller', 'common/controllers/accounts/accounts_add_or_edit_controller' ],
    function (angularAMD) {
        angularAMD.controller('AdminAdvertisersController', function ($scope, $rootScope, $modal, $compile,
            constants, accountsService, momentService,
            loginModel) {
            $(".each_nav_link").removeClass("active_tab");
            $("#admin_nav_link").addClass("active_tab");
            $scope.brandsData = [];
            
            //Responsive Height
            var winHeight = $(window).height();
            $(".table-responsive .tbody").css("min-height", winHeight - 380);

            $scope.fetchAllBrands = function(){
                $scope.loadBrandList = true;
                accountsService.getUserBrands().then(function(res){
                    $scope.loadBrandList = false;
                    if ((res.status === 'OK' || res.status === 'success') && res.data.data.length) {
                        $scope.brandsData = res.data.data;
                        $scope.brandsTotal = _.size(res.data.data);
                        _.each($scope.brandsData, function(item, i){
                            $scope.brandsData[i].createdAt = momentService.newMoment($scope.brandsData[i].createdAt).format('YYYY-MM-DD');
                        })
                    }
                });
            };
            $scope.fetchAllBrands();

            $scope.createBrand = function(){
                if(!$scope.brandName || $scope.brandName.trim() == ""){
                    $rootScope.setErrAlertMessage(constants.BRAND_FEILD_EMPTY);
                    return;
                }
                if($scope.isEditBrand) {
                    var requestBody = $scope.editRequestBody;
                    requestBody.name = $scope.brandName;
                    accountsService.updateBrand(requestBody.id, requestBody).then(function (res) {
                        if (res.status === 'CREATED' || res.status === 'success') {
                            $scope.brandName = "";
                            $scope.fetchAllBrands();
                            $rootScope.setErrAlertMessage(constants.SUCCESS_CREATE_BRAND, 0);
                        } else {
                            $rootScope.setErrAlertMessage(res.data.message);
                            return;
                        }
                    }, function (err) {
                        $rootScope.setErrAlertMessage(err.message);
                        return;
                        //$scope.fetchAllAdvertisers();
                    });
                }else {
                    accountsService.createBrand({name: $scope.brandName}).then(function (res) {
                        if (res.status === 'CREATED' || res.status === 'success') {
                            $scope.brandName = "";
                            $scope.fetchAllBrands();
                            $rootScope.setErrAlertMessage(constants.SUCCESS_CREATE_BRAND, 0);
                        } else {
                            $rootScope.setErrAlertMessage(res.data.message);
                            return;
                        }
                    }, function (err) {
                        $rootScope.setErrAlertMessage(err.message);
                        return;
                        //$scope.fetchAllAdvertisers();
                    });
                }
            }

            $scope.editBrand = function(obj){
                $scope.isEditBrand = obj.id;
                $scope.editRequestBody = obj;
                $scope.brandName = obj.name;
            }

            //Search Hide / Show
            $scope.searchShowInput = function () {
                var searchInputForm = $('.searchInputForm');
                $('.searchInputBtn').hide();
                $('.searchInputBtnInline').show();
                searchInputForm.show();
                searchInputForm.animate({width: '250px'}, 'fast');
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