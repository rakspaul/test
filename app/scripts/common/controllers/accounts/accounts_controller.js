var angObj = angObj || {};
define(['angularAMD', '../../services/constants_service', 'workflow/services/account_service', 'common/moment_utils',
        'login/login_model',
        'common/controllers/accounts/accounts_add_or_edit_advertiser_controller',
        'common/controllers/accounts/accounts_add_or_edit_brand_controller', 'common/controllers/accounts/accounts_add_or_edit_controller'
        ,'workflow/directives/custom_date_picker'],
    function (angularAMD) {    angularAMD.controller('AccountsController', function ($scope, $rootScope, $modal, $compile,
        constants, accountsService, momentService,
        loginModel) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#creative_nav_link').addClass('active');

        _currCtrl = this;
        _currCtrl.pixelIndex = 0;
        $scope.isSuperAdmin = loginModel.getClientData().is_super_admin;
        $scope.brandsList = [];
        $scope.advertisersList = [];
        $scope.clientId = '';
        $scope.parentClientId = '';
        $scope.advertiserId = '';
        $scope.brandName = '';
        $scope.reponseData = '';
        $scope.isEditMode = false;
        $scope.textConstants = constants;
        $scope.clientsDetails = {};
        $scope.advertiserName = '';
        $scope.mode = 'create';
        $scope.client = '';
        $scope.brand = '';
        $scope.allAdvertiser = [];
        $scope.allBrands = [];
        $scope.currency = [];
        $scope.selectedAdvertiserId = '';//this is the advertiser selected from dropdown during new advertiser creation
        $scope.selectedBrandId = '';
        $scope.activeEditAdvertiserTab = "basic";
        $scope.dropdownCss = {
            display: 'none',
            'max-height': '100px',
            overflow: 'scroll',
            top: '60px',
            left: '0px'
        };
        $(".each_nav_link").removeClass("active_tab");
        $("#admin_nav_link").addClass("active_tab");
        $(".miniTabLinks .btn").removeClass("active");
        $("#accounts_link").addClass("active");

        $scope.basicForm = function() {
            $(".miniTabLinks.sub .btn").removeClass("active");
            $(".miniTabLinks.sub .subBasics").addClass("active");
            $scope.activeEditAdvertiserTab = "basic";

            $(".basicForm").show();
            $(".createPixel, #pixelsCnt, .IABForm").hide();
        }
        $scope.showPixelTab = function(){
            $scope.activeEditAdvertiserTab = "pixel";
            $(".createPixel, #pixelsCnt").show();
            $(".basicForm, .IABForm").hide();
            $(".miniTabLinks.sub .btn").removeClass("active");
            $(".miniTabLinks.sub .subPixels").addClass("active");
            _.each($scope.advertiserData.pixels, function(item, i){
                var index = i;
                $('#pixelExpDate_'+i).datepicker('update', item.expiryDate);
                $('#pixelExpDate_'+i).datepicker('setStartDate', momentService.getCurrentYear().toString());
                $('#pixelExpDate_'+i).change(function(e){
                    $scope.advertiserData.pixels[i].expiryDate = $(this).val();
                })
            });

        }
        $scope.addPixel = function(){
            $scope.advertiserData.pixels.push({});
            _currCtrl.setCalanderSetting($scope.advertiserData.pixels.length - 1);
        }
        $scope.showIABTab = function(){
            $scope.activeEditAdvertiserTab = "iab";
//            $(".IABForm").show();
//            $(".createPixel, #pixelsCnt, .basicForm").hide();
//            $(".miniTabLinks.sub .btn").removeClass("active");
//            $(".miniTabLinks.sub .subIABCat").addClass("active");
        }
        $scope.addIAB = function() {
            //Code for Add
        }
        _currCtrl.setCalanderSetting = function(i){
            setTimeout(function(i) {
                $('#pixelExpDate_' + i).datepicker('update', momentService.todayDate('YYYY/MM/DD'));
                $('#pixelExpDate_' + i).datepicker('setStartDate', momentService.getCurrentYear().toString());
                $('#pixelExpDate_' + i).change(function (e) {
                    $scope.advertiserData.pixels[i].expiryDate = $(this).val();
                });
            },25,i);
            _currCtrl.pixelIndex++;
        }
        $scope.removePixel = function(pixelIndex){
            $scope.advertiserData.pixels = _.filter($scope.advertiserData.pixels,function(item,i){
                return i != pixelIndex;
            })
        }
        _currCtrl.pixelJSON = {
            impressionLookBack: 14,
            clickLookBack: 14,
            pixelType: "All",
            pixelName: "",
            pixelDate: momentService.todayDate('YYYY-MM-DD')
        }
        $scope.resetFlashMessage = function(){
            $rootScope.setErrAlertMessage('',0);
        };

        $scope.show_advertisers = function(event,clientId) {
            //$scope.fetchAllAdvertisers(clientId);
            var elem = $(event.target);
            elem.closest(".each-account-details").find(".advertiser-list").toggle() ;
            elem.closest(".each-account-details").find(".particular-account-box").toggleClass("open");
            $scope.fetchAllAdvertisersforClient(clientId);
        };
        $scope.subClientListData = {}
        $scope.getSubClientList = function(event, clientObj){
            $(event.target).toggleClass("active");
            var clientId = clientObj.id;
            if(clientObj.isLeafNode){
                if(typeof ($scope.clientsDetails[clientId]) == "undefined"){
                    $scope.show_advertisers(event, clientObj.id);

                }else{
                    $("#client_"+clientId+"_adv").slideToggle(function(){
                        var ele = $(this).parent();
                        ele.hasClass("open data-loaded") ? ele.removeClass("open data-loaded") : ele.addClass("open data-loaded");
                    });
                }
            }else{
                if(typeof ($scope.clientsDetails[clientId]) != "undefined"){
                    $("#client_"+clientId+"_sub").slideToggle(function(){});
                }else {
                    accountsService.getSubClients(clientId).then(function (res) {
                        var result = res.data.data;
                        if ((res.status === "OK" || res.status === "success") && result.length) {
                            if (!$scope.clientsDetails[clientId]) {
                                $scope.clientsDetails[clientId] = {subclients:[],advertisers:[],brands:{}, advertisersLoader:false}
                            }
                            $scope.clientId = clientId;
                            $scope.clientsDetails[clientId].subclients = result;
                        } else {
                            console.log("Error: To get the sub-client list of " + name);
                            //  $rootScope.setErrAlertMessage(constants.EMPTY_CLIENT_LIST);
                            return false;
                        }
                    }, function (err) {
                        console.log("Error: To get the sub-client list of " + name);
                        //$rootScope.setErrAlertMessage(constants.EMPTY_CLIENT_LIST);
                        return false;
                    });
                }
            }
        }

        $scope.show_advertisers_resp_brands = function(event,client,brand) {
            var elem = $(event.target);
            elem.closest(".each-advertiser").find(".advertiser-resp-brands-list").toggle() ;
            $scope.fetchBrands(client, brand);
        };

        $scope.show_edit = function(type) {
            $(".edit-container").hide();
            $('#'+ type +'-edit-container').toggle('slide', { direction: "right" }, 500);
        };

        $scope.resetAccountPage = function(){
            $scope.brandsList = [];
            $scope.advertisersList = [];
            $scope.clientId = '';
            $scope.parentClientId = '';
            $scope.advertiserId = '';
            $scope.brandName = '';
            $scope.reponseData = '';
            $scope.isEditMode = false;
            $scope.textConstants = constants;
            $scope.clientsDetails = {};
            $scope.advertiserName = '';
            $scope.mode = 'create';
            $scope.client = '';
            $scope.brand = '';
            $scope.allAdvertiser = [];
            $scope.allBrands = [];
            $scope.currency = [];
        }

        $scope.fetchAllClients = function(){
            $scope.loadTopClientList = true;
            $scope.resetAccountPage();
            accountsService.getClients(null,null,'notCancellable').then(function(res) {
                $scope.loadTopClientList = false;
                $scope.clientsDetails[0] = res.data.data;
            },function(err){
                $scope.loadTopClientList = false;
            });

        };
        $scope.fetchAllClients();

        $scope.fetchAllAdvertisersforClient = function(clientId){
            if(!$scope.clientsDetails[clientId]){
                $scope.clientsDetails[clientId] = {subclients:[],advertisers:[],brands:{}, advertisersLoader:false}
            }
            $scope.clientsDetails[clientId].advertisersLoader = true;
            accountsService.getClientsAdvertisers(clientId).then(function(res){
                setTimeout(function(){
                    $("#client_"+clientId+"_adv").slideDown();
                },25);
                //   $scope.subClientListData[clientId].advertisersLoader = false;
                var index = _.findIndex($scope.clientsDetails, function(item) {
                    return item.id == clientId});
                if(!$scope.clientsDetails[clientId]){
                    $scope.clientsDetails[clientId] = {subclients:[],advertisers:[],brands:{}, advertisersLoader:false}
                }
                $scope.clientsDetails[clientId]['advertisers'] = [];
                $scope.clientsDetails[clientId]['advertisers'] = res.data.data;
            });
        };


        $scope.fetchBrands = function(clientId,advertiserId, isReset){
            if(advertiserId != -1) {
                accountsService.getAdvertisersBrand(clientId, advertiserId).then(function (res) {
                    if(res.data.status == "OK" || res.data.status == "success") {
                        if(res.data.data.length) {
                            $scope.clientsDetails[clientId]['brands'][advertiserId] = res.data.data;
                        }else{
                            $rootScope.setErrAlertMessage(constants.EMPTY_BRAND_LIST);
                            return false;
                        }
                    }
                });
            }
        };
        function getPixelsData(clientId, advId){
            accountsService.getPixelsUnderAdvertiser(clientId, advId).then(function(res){
                if(res.data.status == "OK" || res.data.status == "success") {
                    $scope.advertiserData.pixels = res.data.data;
                    _.each($scope.advertiserData.pixels, function(item, i){
                        $scope.advertiserData.pixels[i].pixelTypeName = (item.pixelType == "PAGE_VIEW") ? 'Action - Page View'
                            : (item.pixelType == "AUDIENCE_CREATION") ? 'Audience Creation Pixel' : 'Retargeting Pixel';
                        $scope.advertiserData.pixels[i].isFeedData = true;
                        if(item.expiryDate) {
                            $scope.advertiserData.pixels[i].expiryDate = momentService.newMoment(item.expiryDate).format('YYYY/MM/DD');
                        }
                        // _currCtrl.setCalanderSetting(i, 1);
                    });
                }
            },function(err){

            })
        }
        //Add or Edit Pop up for Advertiser
        $scope.AddOrEditAdvertiserModal = function(advObj,mode,client) {
            var loadTemplate = false;
            $scope.mode = mode;
            $scope.client = client;
            $scope.clientId = client.id;
            $scope.isEditMode = (mode == "edit") ? true : false;
            $scope.advertiserData = {id:'', name: '',lookbackImpressions: 14,lookbackClicks: 14, pixels:[]};
            $scope.activeEditAdvertiserTab = "basic";
            if($scope.isEditMode){
                $scope.selectedAdvertiserId = advObj.id;
                accountsService.getAdvertiserUnderClient(client.id, advObj.id).then(function(res){
                    loadTemplate = true;
                    if(res.data.status == "OK" && res.data.statusCode == 200){
                        $scope.selectedAdvertiserId = res.data.data.id ? res.data.data.id : advObj.id;
                        $scope.advertiserData.lookbackImpressions = res.data.data.lookbackImpressions;
                        $scope.advertiserData.lookbackClicks = res.data.data.lookbackClicks;
                    }
                    getPixelsData(client.id,advObj.id);
                },function(err){
                });
            }else{
            }
            $('html, body').animate({scrollTop : 0},30);

            accountsService.getClientsAdvertisers(client.id).then(function(res){
                loadTemplate = true;
                if(res.data.status == "OK" && res.data.statusCode == 200 && res.data.data.length){
                    $scope.advertiserData.clientId = client.id;
                    $scope.advertisersList = res.data.data;
                }
            },function(err){
                loadTemplate = true;
            });
            var int = setInterval(function(){
                if(loadTemplate){
                    clearInterval(int);
                    var $modalInstance = $modal.open({
                        templateUrl: assets.html_accounts_add_or_edit_advertiser,
                        controller:"AccountsAddOrEditAdvertiser",
                        scope:$scope,
                        windowClass: 'edit-dialog modalAccountRedx',
                        backdrop  : 'static',
                        resolve: {
                            //accountsService.setToBeEditedAdvertiser(advObj);

                            // report: function () {
                            //     return $scope.reportList[index];
                            // },
                            // reportIndex: function() {
                            //     return index;
                            // },
                            // reportList: function() {
                            //     return $scope.reportList;
                            // }
                        }
                    });
                }
            }, 25);
        };


        //Add or Edit Pop up for Brand
        $scope.AddOrEditBrandModal = function(advObj,mode,client,brand) {
            $scope.mode = mode;
            $scope.client = client;
            $scope.brandName = brand.name;
            $scope.advertiser = advObj;
            $scope.clientId = client.id;
            $scope.advertiserId = advObj.id;
            $('html, body').animate({scrollTop : 0},30);
            if(mode == 'edit'){
                // Code for edit brand;
            }
            accountsService.getAdvertisersBrand(client.id,advObj.id).then(function(res){
                if(res.data.status == "OK" && res.data.statusCode == 200 && res.data.data.length){
                    $scope.brandsList = res.data.data;
                }
            });
            var $modalInstance = $modal.open({
                templateUrl: assets.html_accounts_add_or_edit_brand,
                controller:"AccountsAddOrEditBrand",
                scope:$scope,
                windowClass: 'edit-dialog modalAccountRedx',
                resolve: {
                    // report: function () {
                    //     return $scope.reportList[index];
                    // },
                    // reportIndex: function() {
                    //     return index;
                    // },
                    // reportList: function() {
                    //     return $scope.reportList;
                    // }
                }
            });
        };


        $scope.resetBrandAdvertiserAfterEdit = function(mode){
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
        $scope.AddOrEditAccountModal = function(mode,clientObj) {
            $scope.mode = mode;
            $scope.isCreateTopClient = clientObj ? false : true;
            $('html, body').animate({scrollTop : 0},30);
            accountsService.getAllCurrency().then(function(result){
                $scope.currency = result.data.data;
            });
            accountsService.setToBeEditedClient(clientObj);
            $scope.clientObj = clientObj;
            var $modalInstance = $modal.open({
                templateUrl: assets.html_accounts_add_or_edit,
                controller:"AccountsAddOrEdit",
                scope:$scope,
                windowClass: 'edit-dialog modalAccountRedx',
                resolve: {
                    // report: function () {
                    //     return $scope.reportList[index];
                    // },
                    // reportIndex: function() {
                    //     return index;
                    // },
                    // reportList: function() {
                    //     return $scope.reportList;
                    // }
                }
            });
        };

        //create advertiser
        $scope.selectAdvertiser = function(advertiser){
            $scope.dropdownCss.display = 'none';
            $scope.advertiserName = advertiser.name;
            $scope.selectedAdvertiserId = advertiser.id;
            $("#advertiserNameInp").val($scope.advertiserName);
        };

        //create brand
        $scope.selectBrand = function(brand){
            $scope.dropdownCss.display = 'none';
            $scope.brandName = brand.name;
            $scope.selectedBrandId = brand.id;
            $("#brandNameInp").val($scope.brandName);
        };

        $scope.showDropdown = function(){
            $scope.advertiserName = '';
            $scope.selectedAdvertiserId = '';
            $scope.brandName = '';
            $scope.selectedBrandId = '';
            $scope.dropdownCss.display = 'block';
            $(".account_name_list").show();
        };
        $('#pixelExpirationDate').datepicker('update', new Date());

        _currCtrl.fetchAllAdvertisers = function(){
            accountsService.getUserAdvertiser().then(function(res){
                if ((res.status === 'OK' || res.status === 'success') && res.data.data.length) {
                    $scope.advertisersData = res.data.data;
//                    _.each($scope.advertisersData, function(item, i){
//                        $scope.advertisersData[i].createdAt = momentService.newMoment($scope.advertisersData[i].createdAt).format('YYYY-MM-DD');
//                    })
                }
            });
        };
        _currCtrl.fetchAllAdvertisers();

        _currCtrl.fetchAllBrands = function(){
            accountsService.getUserBrands().then(function(res){
                if ((res.status === 'OK' || res.status === 'success') && res.data.data.length) {
                    $scope.brandsData = res.data.data;
//                    _.each($scope.brandsData, function(item, i){
//                        $scope.brandsData[i].createdAt = momentService.newMoment($scope.brandsData[i].createdAt).format('YYYY-MM-DD');
//                    })
                }
            });
        };
        _currCtrl.fetchAllBrands();
    });



    });