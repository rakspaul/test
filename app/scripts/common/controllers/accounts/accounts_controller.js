var angObj = angObj || {};
define(['angularAMD', '../../services/constants_service', 'workflow/services/account_service', 'common/moment_utils',
        'login/login_model',
        'common/controllers/accounts/accounts_add_or_edit_advertiser_controller',
    'common/controllers/accounts/accounts_add_or_edit_brand_controller', 'common/controllers/accounts/accounts_add_or_edit_controller' ],
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
        $scope.dropdownCss = {
            display: 'none',
            'max-height': '100px',
            overflow: 'scroll',
            top: '60px',
            left: '0px'
        };
        $scope.addPixel = function(){
            $scope.advertiserData.pixels.push({});
            _currCtrl.setCalanderSetting();
        }
        _currCtrl.setCalanderSetting = function(){
            setTimeout(function(){
                $('.input-daterange').datepicker({
                    format: "mm/dd/yyyy",
                    orientation: "auto",
                    autoclose: true,
                    todayHighlight: true
                });
            },25);
            $('#pixelExpDate_'+_currCtrl.pixelIndex).datepicker('update', momentService.todayDate('YYYY-MM-DD'));
            $('#pixelExpDate_'+_currCtrl.pixelIndex).datepicker('setStartDate', momentService.getCurrentYear().toString());
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
            var clientId = clientObj.id;
            if(clientObj.isLeafNode){
                if(typeof ($scope.clientsDetails[clientId]) == "undefined"){
                    $scope.show_advertisers(event, clientObj.id);

                }else{
                    $("#client_"+clientId+"_adv").slideToggle();
                }
            }else{
                if(typeof ($scope.clientsDetails[clientId]) != "undefined"){
                    $("#client_"+clientId+"_sub").slideToggle();
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
                        }
                    }, function (err) {
                        console.log("Error: To get the sub-client list of " + name);
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


        $scope.fetchAllClients = function(){
            accountsService.getClients(null,null,'notCancellable').then(function(res) {
                $scope.clientsDetails[0] = res.data.data;
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
                   $scope.clientsDetails[clientId]['advertisers'] = [];
                   $scope.clientsDetails[clientId]['advertisers'] = res.data.data;
               });
        };


        $scope.fetchBrands = function(clientId,advertiserId, isReset){
            if(advertiserId != -1) {
                accountsService.getAdvertisersBrand(clientId, advertiserId).then(function (res) {
                    $scope.clientsDetails[clientId]['brands'][advertiserId] = res.data.data;
                });
            }
        };
        function getPixelsData(clientId, advId){
            accountsService.getPixelsUnderAdvertiser(clientId, advId).then(function(res){
                console.log("res....",res);
                if(res.data.status == "OK" || res.data.status == "success") {
                    $scope.advertiserData.pixels = res.data.data;
                    _.each($scope.advertiserData.pixels, function(item, i){
                        $scope.advertiserData.pixels[i].pixelTypeName = (item.pixelType == "PAGE_VIEW") ? 'Action - Page View'
                                                                            : (item.pixelType == "AUDIENCE_CREATION") ? 'Audience Creation Pixel' : 'Retargeting Pixel';
                        _currCtrl.setCalanderSetting();
                    });
                }
            },function(err){

            })
        }
        //Add or Edit Pop up for Advertiser
        $scope.AddOrEditAdvertiserModal = function(advObj,mode,client) {
            console.log("AddOrEditAdvertiserModal......"+mode);
            $scope.mode = mode;
            $scope.client = client;
            $scope.clientId = client.id;
            $scope.isEditMode = (mode == "edit") ? true : false;
            if($scope.isEditMode){
                $scope.selectedAdvertiserId = advObj.id;

                getPixelsData(client.id,advObj.id);
//                $scope.advertiserData = {}
//                accountsService.getClientAdvertiserDetails(client.id, advObj.id).then(function(res){
//                    console.log("res.....",res);
//                },function(err){
//
//                });
            }else{
                console.log("adsfadf    ");
            }
            $('html, body').animate({scrollTop : 0},30);
//            if(mode == 'edit'){
//               // accountsService.setToBeEditedadvertiserData(advObj);
//               // $scope.advertiserName = advObj.name;
//                $scope.advertiserData = {}
//                accountsService.getAdvertiserDetails(client.id, advObj.id,function(res){
//                   console.log("Edit advtiser data......",res);
//                });
//            }
//            else{
//                accountsService.getAllAdvertisers().then(function(result){
//                    $scope.allAdvertiser = result.data.data;
//                });
//            }
            $scope.advertiserData = {id:'', name: '',impressionLookBack: 14,clickLookBack: 14, pixels:[]};
            accountsService.getClientsAdvertisers(client.id).then(function(res){
                if(res.data.status == "OK" && res.data.statusCode == 200 && res.data.data.length){
                    $scope.advertiserData.clientId = client.id;
                    $scope.advertisersList = res.data.data;
                }
            });
            var $modalInstance = $modal.open({
                templateUrl: assets.html_accounts_add_or_edit_advertiser,
                controller:"AccountsAddOrEditAdvertiser",
                scope:$scope,
                windowClass: 'edit-dialog modalAccountRedx',
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
        };


        //Add or Edit Pop up for Brand
        $scope.AddOrEditBrandModal = function(advObj,mode,client,brand) {
            $scope.mode = mode;
            $scope.client = client;
            $scope.brandName = brand.name;
            $scope.advertiser = advObj;
            $scope.clientId = client.id;
            $scope.advertiserId = advObj.id;
//            $scope.
            $('html, body').animate({scrollTop : 0},30);
            if(mode == 'edit'){
               // accountsService.setToBeEditedBrand(brand);
//                accountsService.getAdvertiserBrandDetials(client.id, advObj.id, brand.id).then(function(res){
//                    console.log("data.....",res);
//                },function(err){
//
//                });
                //$scope.brandName = brand.name;
            }
//            else{
//                accountsService.getAllBrands().then(function(result){
//                    $scope.allBrands = result.data.data;
//                });
//            }
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
            $('html, body').animate({scrollTop : 0},30);
            accountsService.getAllCurrency().then(function(result){
                $scope.currency = result.data.data;
               // console.log($scope.currency);
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
            console.log("fetchAllAdvertisers......");
            accountsService.getUserAdvertiser().then(function(res){
                console.log("brandList....",res);
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
            console.log("fetchAllAdvertisers......");
            accountsService.getUserBrands().then(function(res){
                console.log("brandList....",res);
                if ((res.status === 'OK' || res.status === 'success') && res.data.data.length) {
                    $scope.brandsData = res.data.data;
//                    _.each($scope.brandsData, function(item, i){
//                        $scope.brandsData[i].createdAt = momentService.newMoment($scope.brandsData[i].createdAt).format('YYYY-MM-DD');
//                    })
                }
            });
        };
        _currCtrl.fetchAllBrands();

        //_currCtrl.getAllAdvertisers = function(){}
    });



    });
