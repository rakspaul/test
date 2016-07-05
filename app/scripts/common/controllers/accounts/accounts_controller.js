var angObj = angObj || {};

define(['angularAMD', '../../services/constants_service', 'workflow/services/account_service', // jshint ignore:line
    'common/moment_utils', 'login/login_model', 'common/utils',
    'common/controllers/accounts/accounts_add_or_edit_advertiser_controller',
    'common/controllers/accounts/accounts_add_or_edit_brand_controller',
    'common/controllers/accounts/accounts_add_or_edit_controller', 'workflow/directives/custom_date_picker'],
    function (angularAMD) {
        angularAMD.controller('AccountsController', function ($scope, $rootScope, $modal, $compile, $sce, constants,
                                                              accountsService, momentService, loginModel, utils) {
            var _currCtrl = this;

            _currCtrl.verifyPixelInput = function () {
                var ret = true,
                    errMsg = 'Error',
                    item = $scope.pixelFormData;

                if ($scope.advertiserAddOrEditData.duplicatePixelName) {
                    return false;
                }

                if (!item.name) {
                    errMsg = constants.EMPTY_PIXEL_FIELD;
                    ret = false;
                } else if (!item.pixelType) {
                    errMsg = constants.EMPTY_PIXEL_TYPE;
                    ret = false;
                } else if (!item.expiryDate) {
                    errMsg = constants.EMPTY_PIXEL_EXPIREAT;
                    ret = false;
                } else if (!item.impLookbackWindow) {
                    errMsg = constants.EMPTY_LOOKBACK_IMPRESSION;
                    ret = false;
                } else if (!item.clickLookbackWindow) {
                    errMsg = constants.EMPTY_LOOKBACK_CLICK;
                    ret = false;
                }

                if (!ret) {
                    $rootScope.setErrAlertMessage(errMsg);
                }

                return ret;
            };

            _currCtrl.fetchAllAdvertisers = function () {
                accountsService
                    .getUserAdvertiser()
                    .then(function (res) {
                        if ((res.status === 'OK' || res.status === 'success') && res.data.data.length) {
                            $scope.advertisersData = res.data.data;
                        }
                    });
            };

            _currCtrl.fetchAllBrands = function () {
                accountsService
                    .getUserBrands()
                    .then(function (res) {
                        if ((res.status === 'OK' || res.status === 'success') && res.data.data.length) {
                            $scope.brandsData = res.data.data;
                        }
                    });
            };

            _currCtrl.setCalanderSetting = function () {
                var pixelExpDate = $('#pixelExpDate');

                pixelExpDate.datepicker('update', momentService.todayDate('YYYY/MM/DD'));

                pixelExpDate.change(function () {
                    $scope.pixelFormData.expiryDate = $(this).val();
                });
            };

            _currCtrl.pixelJSON = {
                impressionLookBack: 14,
                clickLookBack: 14,
                pixelType: 'All',
                pixelName: '',
                pixelDate: momentService.todayDate('YYYY-MM-DD')
            };

            $scope.leavefocusPixelName = function(name){
                $scope.pixelFormData.pixelCode = name.replace(utils.regExp().removeSpecialCharacterAndSpaces, '');
            };

            function getPixelsData(clientId, advId) {
                accountsService
                    .getPixelsUnderAdvertiser(clientId, advId)
                    .then(function (res) {
                        if (res.data.status === 'OK' || res.data.status === 'success') {
                            $scope.advertiserData.pixels = res.data.data;

                            _.each($scope.advertiserData.pixels, function (item, i) { // jshint ignore:line
                                $scope.advertiserData.pixels[i].pixelTypeName =
                                    (item.pixelType === 'PAGE_VIEW') ? 'Action - Page View' :
                                        (item.pixelType === 'AUDIENCE_CREATION') ?
                                            'Audience Creation Pixel' : 'Retargeting Pixel';

                                $scope.advertiserData.pixels[i].isFeedData = true;

                                if (item.expiryDate) {
                                    $scope.advertiserData.pixels[i].expiryDate =
                                        momentService.utcToLocalTime(item.expiryDate,'YYYY/MM/DD');
                                }

                                $scope.advertiserData.impLookbackWindow = item.impLookbackWindow;
                                $scope.advertiserData.clickLookbackWindow = item.clickLookbackWindow;
                            });
                        }
                    },function () {
                    });
            }

            $('.main_navigation')
                .find('.active')
                .removeClass('active')
                .end()
                .find('#creative_nav_link')
                .addClass('active');

            $scope.pixelIndex = null;
            $scope.pixelFormData = {
                name: '',
                pixelType: '',
                expiryDate: '',
                pixelCode: '',
                description: '',
                pixelTypeName: 'Select Pixel Type'
            };

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

            //this is the advertiser selected from dropdown during new advertiser creation
            $scope.selectedAdvertiserId = '';

            $scope.selectedBrandId = '';
            $scope.activeEditAdvertiserTab = 'basic';
            $scope.advertiserAddOrEditData = {};

            $scope.dropdownCss = {
                display: 'none',
                'max-height': '100px',
                overflow: 'scroll',
                top: '60px',
                left: '0px'
            };

            $scope.basicForm = function () {
                $('.miniTabLinks.sub .btn').removeClass('active');
                $('.miniTabLinks.sub .subBasics').addClass('active');
                $scope.activeEditAdvertiserTab = 'basic';

                $('.basicForm, .IABForm').show();
                $('.createPixel, #pixelsCnt').hide();
            };

            $scope.showPixelTab = function () {
                $scope.activeEditAdvertiserTab = 'pixel';

                $('.createPixel, #pixelsCnt').show();
                $('.basicForm, .IABForm').hide();
                $('.miniTabLinks.sub .btn').removeClass('active');
                $('.miniTabLinks.sub .subPixels').addClass('active');
                $('.pixelCreate').hide();
            };

            $scope.addPixel = function () {
                _currCtrl.setCalanderSetting();

                $('#pixelExpDate').datepicker('setStartDate', momentService.getCurrentYear().toString());
                $('.pixelCreate').slideDown();

                $scope.pixelFormData.impLookbackWindow = $scope.pixelFormData.clickLookbackWindow = 14;
            };

            $scope.savePixel = function () {
                var keyArr;

                if (_currCtrl.verifyPixelInput()) {
                    if ($scope.pixelIndex !== null) {
                        // Update
                        keyArr = [
                            'name',
                            'pixelType',
                            'expiryDate',
                            'pixelCode',
                            'description',
                            'impLookbackWindow',
                            'clickLookbackWindow'
                        ];

                        _.each(keyArr,function (v) { // jshint ignore:line
                            $scope.advertiserData.pixels[$scope.pixelIndex][v] =  $scope.pixelFormData[v];
                        });
                    } else {
                        // Create
                        $scope.advertiserData.pixels.push($scope.pixelFormData);
                    }

                    $scope.clearPixel();
                }
            };

            $scope.removePixel = function () {
                $scope.advertiserData.pixels =
                    _.filter($scope.advertiserData.pixels,function (item, i) { // jshint ignore:line
                        return i !== $scope.pixelIndex;
                    });

                $scope.clearPixel();
            };

            $scope.editPixel = function (index, pixel) {
                $('.pixelCreate').slideDown();
                $('#pixelExpDate').datepicker('setStartDate', momentService.getCurrentYear().toString());
                $scope.pixelIndex = index;
                $scope.pixelFormData = JSON.parse(JSON.stringify(pixel));
            };

            $scope.clearPixel = function () {
                $('.pixelCreate').slideUp();

                $scope.pixelFormData = {
                    name: '',
                    pixelType: '',
                    expiryDate: '',
                    description: '',
                    pixelCode: '',
                    pixelTypeName: 'Select Pixel Type',
                    impLookbackWindow: '',
                    clickLookbackWindow: ''
                };

                $scope.pixelIndex = null;
                $scope.advertiserAddOrEditData.duplicatePixelName = false;
            };

            $scope.cancelPixel = function () {
                $scope.clearPixel();
            };

            $scope.showIABTab = function () {
                $scope.activeEditAdvertiserTab = 'iab';
            };

            $scope.resetFlashMessage = function () {
                $rootScope.setErrAlertMessage('', 0);
            };

            $scope.show_advertisers = function (event, clientId) {
                var elem = $(event.target);

                elem.closest('.each-account-details').find('.advertiser-list').toggle();
                elem.closest('.each-account-details').find('.particular-account-box').toggleClass('open');
                $scope.fetchAllAdvertisersforClient(clientId);
            };

            $scope.subClientListData = {};

            $scope.getSubClientList = function (event, clientObj) {
                var clientId = clientObj.id,
                    ele;

                $(event.target).toggleClass('active');

                if (clientObj.isLeafNode) {
                    if (typeof ($scope.clientsDetails[clientId]) === 'undefined') {
                        $scope.show_advertisers(event, clientObj.id);
                    } else {
                        $('#client_' + clientId + '_adv').slideToggle(function () {
                            ele = $(this).parent();
                            ele.hasClass('open data-loaded') ?
                                ele.removeClass('open data-loaded') :
                                ele.addClass('open data-loaded');
                        });
                    }
                } else {
                    if (typeof ($scope.clientsDetails[clientId]) !== 'undefined') {
                        $('#client_' + clientId + '_sub').slideToggle(function () {});
                    } else {
                        accountsService
                            .getSubClients(clientId)
                            .then(function (res) {
                                var result = res.data.data;

                                if ((res.status === 'OK' || res.status === 'success') && result.length) {
                                    if (!$scope.clientsDetails[clientId]) {
                                        $scope.clientsDetails[clientId] = {
                                            subclients: [],
                                            advertisers: [],
                                            brands: {},
                                            advertisersLoader: false
                                        };
                                    }

                                    $scope.clientId = clientId;
                                    $scope.clientsDetails[clientId].subclients = result;
                                } else {
                                    return false;
                                }
                            }, function (err) {
                                console.log('Error: ', err);
                                return false;
                            });
                    }
                }
            };

            $scope.show_advertisers_resp_brands = function (event, client, brand) {
                var elem = $(event.target);

                elem.closest('.each-advertiser').find('.advertiser-resp-brands-list').toggle();
                $scope.fetchBrands(client, brand);
            };

            $scope.show_edit = function (type) {
                $('.edit-container').hide();
                $('#'+ type +'-edit-container').toggle('slide', { direction: 'right' }, 500);
            };

            $scope.resetAccountPage = function () {
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
            };

            $scope.fetchAllClients = function () {
                $scope.loadTopClientList = true;
                $scope.resetAccountPage();

                accountsService
                    .getClients(null,null,'notCancellable')
                    .then(function (res) {
                        $scope.loadTopClientList = false;
                        $scope.clientsDetails[0] = res.data.data;
                    }, function (err) {
                        $scope.loadTopClientList = false;
                        console.log('Error = ', err);
                    });
            };

            $scope.fetchAllAdvertisersforClient = function (clientId) {
                if (!$scope.clientsDetails[clientId]) {
                    $scope.clientsDetails[clientId] = {
                        subclients: [],
                        advertisers: [],
                        brands: {},
                        advertisersLoader: false
                    };
                }

                $scope.clientsDetails[clientId].advertisersLoader = true;

                accountsService
                    .getClientsAdvertisers(clientId)
                    .then(function (res) {
                        var index;

                        setTimeout(function () {
                            $('#client_' + clientId + '_adv').slideDown();
                        }, 25);

                        index = _.findIndex($scope.clientsDetails, function (item) { // jshint ignore:line
                            return item.id === clientId;
                        });

                        if (!$scope.clientsDetails[clientId]) {
                            $scope.clientsDetails[clientId] = {
                                subclients: [],
                                advertisers: [],
                                brands: {},
                                advertisersLoader:false
                            };
                        }

                        $scope.clientsDetails[clientId].advertisers = res.data.data;
                    });
            };

            $scope.fetchBrands = function (clientId, advertiserId) {
                if (advertiserId !== -1) {
                    accountsService
                        .getAdvertisersBrand(clientId, advertiserId)
                        .then(function (res) {
                            if (res.data.status === 'OK' || res.data.status === 'success') {
                                if (res.data.data.length) {
                                    $scope.clientsDetails[clientId].brands[advertiserId] = res.data.data;
                                } else {
                                    $rootScope.setErrAlertMessage(constants.EMPTY_BRAND_LIST);
                                    return false;
                                }
                            }
                        });
                }
            };

            //Add or Edit Pop up for Advertiser
            $scope.AddOrEditAdvertiserModal = function (advObj, mode, client) {
                var loadTemplate = false;

                $scope.mode = mode;
                $scope.client = client;
                $scope.clientId = client.id;
                $scope.isEditMode = (mode === 'edit') ? true : false;

                $scope.advertiserData = {
                    id: '',
                    name: '',
                    lookbackImpressions: 14,
                    lookbackClicks: 14,
                    pixels:[]
                };

                $scope.activeEditAdvertiserTab = 'basic';
                $scope.clientObj = client;
                $scope.advObj = advObj;

                if ($scope.isEditMode) {
                    $scope.selectedAdvertiserId = advObj.id;
                    $scope.selectedAdvertiser = advObj.name;
                    $scope.setSelectedAdvertiserCode = advObj.code;

                    accountsService
                        .getAdvertiserUnderClient(client.id, advObj.id)
                        .then(function (res) {
                            var result;

                            loadTemplate = true;

                            if (res.data.status === 'OK' && res.data.statusCode === 200) {
                                result = res.data.data;
                                $scope.savedAdvertiserData = result;

                                $scope.selectedAdvertiserId = result.id ? result.id : advObj.id;
                                $scope.selectedAdvertiser = result.name ? result.name : advObj.name;
                                $scope.advertiserData.lookbackImpressions = result.lookbackImpressions;
                                $scope.advertiserData.lookbackClicks = result.lookbackClicks;
                            }

                            getPixelsData(client.id,advObj.id);
                        }, function (err) {
                            console.log('Error = ', err);
                        });
                } else {
                    $scope.selectedAdvertiserId = '';
                    $scope.selectedAdvertiser = 'Select Advertiser';
                }

                $('html, body').animate({scrollTop : 0}, 30);

                accountsService
                    .getClientsAdvertisers(client.id)
                    .then(function (res) {
                        loadTemplate = true;

                        if (res.data.status === 'OK' && res.data.statusCode === 200 && res.data.data.length) {
                            $scope.advertiserData.clientId = client.id;
                            $scope.advertisersList = res.data.data;
                        }
                    }, function (err) {
                        console.log('Error = ', err);
                        loadTemplate = true;
                    });

                var int = setInterval(function () {
                    var $modalInstance;

                    ($scope.isEditMode && !$scope.savedAdvertiserData && (loadTemplate = false));

                    if (loadTemplate) {
                        clearInterval(int);

                        $modalInstance = $modal.open({
                            templateUrl: assets.html_accounts_add_or_edit_advertiser, // jshint ignore:line
                            controller: 'AccountsAddOrEditAdvertiser',
                            scope: $scope,
                            windowClass: 'edit-dialog modalAccountRedx',
                            backdrop: 'static',
                            resolve: {
                            }
                        });
                    }
                }, 25);
            };

            //Add or Edit Pop up for Brand
            $scope.AddOrEditBrandModal = function (advObj, mode, client, brand) {
                var modalInstance;

                $scope.mode = mode;
                $scope.client = client;
                $scope.brandName = brand.name;
                $scope.advertiser = advObj;
                $scope.clientId = client.id;
                $scope.advertiserId = advObj.id;
                $('html, body').animate({scrollTop: 0}, 30);

                accountsService
                    .getAdvertisersBrand(client.id, advObj.id)
                    .then(function (res) {
                        if (res.data.status === 'OK' && res.data.statusCode === 200 && res.data.data.length) {
                            $scope.brandsList = res.data.data;
                        }
                    });

                modalInstance = $modal.open({
                    templateUrl: assets.html_accounts_add_or_edit_brand, // jshint ignore:line
                    controller: 'AccountsAddOrEditBrand',
                    scope: $scope,
                    windowClass: 'edit-dialog modalAccountRedx',
                    resolve: {
                    }
                });
            };

            $scope.resetBrandAdvertiserAfterEdit = function () {
                $scope.mode = 'create';
                $scope.client = '';
                $scope.brand = '';
                $scope.advertiser = '';
                $scope.client = '';
                $scope.selectedAdvertiserId = '';
                $scope.advertiserName = '';
                $scope.brandName = '';
                $scope.clientName = '';
                $scope.setSelectedClientCode = '';
                $scope.selectedBrandId = '';
                $scope.allBrands = [];
                $scope.allAdvertiser = [];
                $scope.dropdownCss.display = 'none';
                $scope.setSelectedAdvertiserCode = '';
                accountsService.setToBeEditedAdvertiser(null);
                accountsService.setToBeEditedBrand(null);
                accountsService.setToBeEditedClient(null);

                $scope.pixelFormData = {
                    name: '',
                    pixelType: '',
                    expiryDate: '',
                    pixelCode: '',
                    description: '',
                    pixelTypeName: 'Select Pixel Type'
                };
            };

            //Add or Edit Pop up for Account
            $scope.AddOrEditAccountModal = function (mode, clientObj) {
                var $modalInstance;

                $scope.mode = mode;

                $scope.isCreateTopClient = clientObj ? false : true;
                $('html, body').animate({scrollTop : 0}, 30);

                accountsService
                    .getAllCurrency()
                    .then(function (result) {
                        $scope.currency = result.data.data;
                    });

                accountsService.setToBeEditedClient(clientObj);
                $scope.clientObj = clientObj;

                $modalInstance = $modal.open({
                    templateUrl: assets.html_accounts_add_or_edit, // jshint ignore:line
                    controller: 'AccountsAddOrEdit',
                    scope: $scope,
                    windowClass: 'edit-dialog modalAccountRedx',
                    resolve: {
                    }
                });
            };

            //create brand
            $scope.selectBrand = function (brand) {
                $scope.dropdownCss.display = 'none';
                $scope.brandName = brand.name;
                $scope.selectedBrandId = brand.id;
                $('#brandNameInp').val($scope.brandName);
            };

            $scope.selectClientCode = function(ev, code){
                var clientAccountCode = $('.customClientCode, .accountCode'),
                    addClass = (code === 'Others') ? 'col-md-6' : 'col-md-12';

                $scope.setSelectedClientCode = code;
                clientAccountCode.removeClass('col-md-12').removeClass('col-md-6');
                clientAccountCode.addClass(addClass);
            };

            $scope.feesTooltip = function (client) {
                var tooltipText = '',
                    currencySymbol = client.currency ? client.currency.currencySymbol : '$',
                    techFees = client.techFeesBillingValue,
                    serviceFeesType = client.serviceFeesBillingTypeId,
                    serviceFees = client.serviceFeesBillingValue;

                if (serviceFees) {
                    if (serviceFeesType === 6) {
                        tooltipText += 'Service Fees (COGS+ %' + '): ';
                    } else {
                        tooltipText += 'Service Fees (CPM' + '): ';
                    }

                    // If service Fees Type is COGS+ %
                    if (serviceFeesType === 6) {
                        tooltipText += serviceFees + '%';
                    } else {
                        tooltipText += currencySymbol + serviceFees;
                    }
                } else {
                    tooltipText += 'Service Fees: N/A';
                }

                if (techFees) {
                    tooltipText += ',  Tech Fees (CPM): ' + currencySymbol + techFees;
                } else {
                    tooltipText += ',  Tech Fees: N/A';
                }

                return $sce.trustAsHtml(tooltipText);
            };

            $scope.fetchAllClients();

            $('.each_nav_link').removeClass('active_tab');
            $('#admin_nav_link').addClass('active_tab');
            $('.miniTabLinks .btn').removeClass('active');
            $('#accounts_link').addClass('active');

            $('#pixelExpirationDate').datepicker('update', new Date());

            _currCtrl.fetchAllAdvertisers();
            _currCtrl.fetchAllBrands();
        });
    }
);
