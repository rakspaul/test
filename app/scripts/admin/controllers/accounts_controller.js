define(['angularAMD', 'common-utils', 'admin-account-service', 'accounts-add-or-edit-advertiser-controller', 'accounts-add-or-edit-brand-controller',
    'accounts-add-or-edit-controller', 'custom-date-picker'], function (angularAMD) {
        'use strict';

        angularAMD.controller('AccountsController', ['$scope', '$rootScope', '$modal', '$compile', '$sce', 'constants', 'adminAccountsService', 'momentService',
            'loginModel', 'pageLoad', function ($scope, $rootScope, $modal, $compile, $sce, constants, adminAccountsService, momentService, loginModel, pageLoad) {
                var _currCtrl = this;

                console.log('ADMIN ACCOUNTS controller is loaded!');
                // Hide page loader when the page is loaded
                pageLoad.hidePageLoader();

                _currCtrl.pixelTypeCode = {
                    RETARGETING: 'rt',
                    AUDIENCE_CREATION: 'll',
                    PAGE_VIEW: 'cv'
                };

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

                _currCtrl.fetchAllAdvertisers = function (clientId, query, pageSize, pageNo) {
                    query = query || '';
                    pageSize = pageSize || $scope.advertisersPageSize;
                    pageNo = pageNo || 0;
                    $scope.advertisersPageNo = ++pageNo;

                    adminAccountsService
                        .getUserAdvertiser(clientId, query, pageSize, $scope.advertisersPageNo)
                        .then(function (res) {
                            if ((res.status === 'OK' || res.status === 'success')) {
                                if (res.data.data.length > 0) {
                                    if (res.data.data.length < pageSize) {
                                        $scope.noMoreAdvertisersToLoad = true;
                                    } else {
                                        $scope.noMoreAdvertisersToLoad = false;
                                    }

                                    if (pageNo === 1) {
                                        $scope.advertisersData = res.data.data;
                                    } else {
                                        Array.prototype.push.apply($scope.advertisersData, res.data.data);
                                    }
                                } else {
                                    $scope.noMoreAdvertisersToLoad = true;
                                }

                                // If no data is found for the search query entered by the user
                                if ($scope.advertisersData.length === 0) {
                                    $scope.advertisersData = [{id: 0, name: 'No matching Advertisers found!'}];
                                }

                                $scope.advertisersLoading = false;
                            }
                        });
                };

                _currCtrl.fetchAllBrands = function (clientId, query, pageSize, pageNo) {
                    query = query || '';
                    pageSize = pageSize || $scope.brandsPageSize;
                    pageNo = pageNo || 0;
                    $scope.brandsPageNo = ++pageNo;

                    adminAccountsService
                        .getUserBrands(clientId, query, pageSize, $scope.brandsPageNo)
                        .then(function (res) {
                            if ((res.status === 'OK' || res.status === 'success')) {
                                if (res.data.data.length > 0) {
                                    if (res.data.data.length < pageSize) {
                                        $scope.noMoreBrandsToLoad = true;
                                    } else {
                                        $scope.noMoreBrandsToLoad = false;
                                    }

                                    if (pageNo === 1) {
                                        $scope.brandsData = res.data.data;
                                    } else {
                                        Array.prototype.push.apply($scope.brandsData, res.data.data);
                                    }
                                } else {
                                    $scope.noMoreBrandsToLoad = true;
                                }

                                // If no data is found for the search query entered by the user
                                if ($scope.brandsData.length === 0) {
                                    $scope.brandsData = [{id: 0, name: 'No matching Brands found!'}];
                                }

                                $scope.brandsLoading = false;
                            }
                        });
                };

                _currCtrl.setCalenderSetting = function () {
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

                function getPixelsData(clientId, advId) {
                    adminAccountsService
                        .getPixels(clientId, advId)
                        .then(function (res) {
                            if (res.data.status === 'OK' || res.data.status === 'success') {
                                $scope.topCtrlData.pixels = res.data.data;

                                _.each($scope.topCtrlData.pixels, function (item, i) {
                                    $scope.topCtrlData.pixels[i].pixelTypeName =
                                        (item.pixelType === 'PAGE_VIEW') ? 'Action - Page View' :
                                            (item.pixelType === 'AUDIENCE_CREATION') ?
                                                'Audience Creation Pixel' : 'Retargeting Pixel';

                                    $scope.topCtrlData.pixels[i].isFeedData = true;

                                    if (item.expiryDate) {
                                        $scope.topCtrlData.pixels[i].expiryDate =
                                            momentService.utcToLocalTime(item.expiryDate,'YYYY/MM/DD');
                                    }

                                    $scope.topCtrlData.impLookbackWindow = item.impLookbackWindow;
                                    $scope.topCtrlData.clickLookbackWindow = item.clickLookbackWindow;
                                });
                            }
                        },function () {
                        });
                }

                // Brands & Advertisers data init here
                $scope.brandsData = [];
                $scope.brandsPageSize = 3000;
                $scope.brandsPageNo = 0;
                $scope.brandsQuery = '';
                $scope.noMoreBrandsToLoad = false;
                $scope.brandsLoading = false;
                $scope.advertisersData = [];
                $scope.advertisersPageSize = 3000;
                $scope.advertisersPageNo = 0;
                $scope.advertisersQuery = '';
                $scope.noMoreAdvertisersToLoad = false;
                $scope.advertisersLoading = false;
                // End of Brands & Advertisers data init here

                $scope.pixelIndex = null;
                $scope.pixelFormData = {
                    name: '',
                    pixelType: '',
                    expiryDate: '',
                    description: '',
                    pixelTypeName: 'Select Pixel Type'
                };

                $scope.topCtrlData = {
                    id: '',
                    companyUrl: '',
                    name: '',
                    lookbackImpressions: 14,
                    lookbackClicks: 14,
                    pixels:[],
                    disableDownLoadPixel : true
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

                // this is the advertiser selected from dropdown during new advertiser creation
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
                    $scope.clearPixel();
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
                    _currCtrl.setCalenderSetting();

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
                                'description',
                                'impLookbackWindow',
                                'clickLookbackWindow'
                            ];

                            _.each(keyArr,function (v) {
                                $scope.topCtrlData.pixels[$scope.pixelIndex][v] =  $scope.pixelFormData[v];
                            });
                        } else {
                            // Create
                            $scope.topCtrlData.pixels.push($scope.pixelFormData);
                        }

                        $scope.clearPixel();
                    }
                };

                $scope.removePixel = function () {
                    $scope.topCtrlData.pixels =
                        _.filter($scope.topCtrlData.pixels,function (item, i) {
                            return i !== $scope.pixelIndex;
                        });

                    $scope.clearPixel();
                };

                $scope.editPixel = function (index, pixel) {
                    $scope.pixelFormData.segmentName = '';
                    $('.pixelCreate').slideDown();
                    $('#pixelExpDate').datepicker('setStartDate', momentService.getCurrentYear().toString());
                    $scope.pixelIndex = index;
                    $scope.pixelFormData = JSON.parse(JSON.stringify(pixel));

                    if($scope.pixelFormData.pixelCode) {
                        $scope.pixelFormData.segmentName =
                            'visto-' + _currCtrl.pixelTypeCode[$scope.pixelFormData.pixelType] + '-' +
                            $scope.selectedClientCode + '-' + $scope.setSelectedAdvertiserCode + '-' +
                            $scope.pixelFormData.pixelCode;
                    }
                };

                $scope.clearPixel = function () {
                    $('.pixelCreate').slideUp();

                    $scope.pixelFormData = {
                        name: '',
                        pixelType: '',
                        expiryDate: '',
                        description: '',
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
                            adminAccountsService
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

                    adminAccountsService
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

                    adminAccountsService
                        .getClientsAdvertisers(clientId)
                        .then(function (res) {
                            var index;

                            setTimeout(function () {
                                $('#client_' + clientId + '_adv').slideDown();
                            }, 25);

                            index = _.findIndex($scope.clientsDetails, function (item) {
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
                        adminAccountsService
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

                // Add or Edit Pop up for Advertiser
                $scope.AddOrEditAdvertiserModal = function (advObj, mode, client) {
                    var loadTemplate = false,
                        int;

                    $scope.mode = mode;
                    $scope.client = client;
                    $scope.clientId = client.id;
                    $scope.isEditMode = (mode === 'edit') ? true : false;


                    $scope.activeEditAdvertiserTab = 'basic';
                    $scope.clientObj = client;
                    $scope.advObj = advObj;
                    $scope.selectedClientCode = client.code;

                    if ($scope.isEditMode) {
                        $scope.selectedAdvertiserId = advObj.id;
                        $scope.selectedAdvertiser = advObj.name;
                        $scope.setSelectedAdvertiserCode = advObj.code;
                        adminAccountsService
                            .getAdvertiserUnderClient(client.id, advObj.id)
                            .then(function (res) {
                                var result;

                                loadTemplate = true;

                                if (res.data.status === 'OK' && res.data.statusCode === 200) {
                                    result = res.data.data;
                                    $scope.savedAdvertiserData = result;

                                    $scope.selectedAdvertiserId = result.id ? result.id : advObj.id;
                                    $scope.selectedAdvertiser = result.name ? result.name : advObj.name;
                                    $scope.topCtrlData.lookbackImpressions = result.lookbackImpressions;
                                    $scope.topCtrlData.lookbackClicks = result.lookbackClicks;
                                    $scope.topCtrlData.companyUrl = result.companyUrl || '';
                                }

                                getPixelsData(client.id,advObj.id);
                            }, function (err) {
                                console.log('Error = ', err);
                            });
                    } else {
                        $scope.selectedAdvertiserId = '';
                        $scope.selectedAdvertiser = 'Select Advertiser';
                        _currCtrl.fetchAllAdvertisers(client.id);
                    }

                    $('html, body').animate({scrollTop : 0}, 30);

                    adminAccountsService
                        .getClientsAdvertisers(client.id)
                        .then(function (res) {
                            loadTemplate = true;

                            if (res.data.status === 'OK' && res.data.statusCode === 200 && res.data.data.length) {
                                $scope.topCtrlData.clientId = client.id;
                                $scope.advertisersList = res.data.data;
                            }
                        }, function (err) {
                            console.log('Error = ', err);
                            loadTemplate = true;
                        });

                    int = setInterval(function () {
                        var $modalInstance;

                        ($scope.isEditMode && !$scope.savedAdvertiserData && (loadTemplate = false));

                        if (loadTemplate) {
                            clearInterval(int);

                            $modalInstance = $modal.open({
                                templateUrl: assets.html_accounts_add_or_edit_advertiser,
                                controller: 'AccountsAddOrEditAdvertiser',
                                scope: $scope,
                                windowClass: 'edit-dialog modalAccountRedx',
                                backdrop: 'static',
                                resolve: {}
                            });
                        }
                    }, 25);
                };

                // Add or Edit Pop up for Brand
                $scope.AddOrEditBrandModal = function (advObj, mode, client, brand) {
                    var modalInstance;

                    $scope.mode = mode;
                    $scope.client = client;
                    $scope.brandName = brand.brandName;
                    $scope.advertiser = advObj;
                    $scope.clientId = client.brandId;
                    $scope.advertiserId = advObj.id;
                    $('html, body').animate({scrollTop: 0}, 30);
                    _currCtrl.fetchAllBrands(client.id);
                    adminAccountsService
                        .getAdvertisersBrand(client.id, advObj.id)
                        .then(function (res) {
                            if (res.data.status === 'OK' && res.data.statusCode === 200 && res.data.data.length) {
                                $scope.brandsList = res.data.data;
                            }
                        });

                    modalInstance = $modal.open({
                        templateUrl: assets.html_accounts_add_or_edit_brand,
                        controller: 'AccountsAddOrEditBrand',
                        scope: $scope,
                        windowClass: 'edit-dialog modalAccountRedx',
                        backdrop: 'static',
                        resolve: {}
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
                    adminAccountsService.setToBeEditedAdvertiser(null);
                    adminAccountsService.setToBeEditedBrand(null);
                    adminAccountsService.setToBeEditedClient(null);

                    $scope.pixelFormData = {
                        name: '',
                        pixelType: '',
                        expiryDate: '',
                        description: '',
                        pixelTypeName: 'Select Pixel Type'
                    };
                };

                // Add or Edit Pop up for Account
                $scope.AddOrEditAccountModal = function (mode, clientObj) {
                    var $modalInstance;

                    $scope.mode = mode;

                    $scope.isCreateTopClient = clientObj ? false : true;
                    $('html, body').animate({scrollTop : 0}, 30);

                    adminAccountsService
                        .getAllCurrency()
                        .then(function (result) {
                            $scope.currency = result.data.data;
                        });

                    adminAccountsService.setToBeEditedClient(clientObj);
                    $scope.clientObj = clientObj;

                    $modalInstance = $modal.open({
                        templateUrl: assets.html_accounts_add_or_edit,
                        controller: 'AccountsAddOrEdit',
                        scope: $scope,
                        windowClass: 'edit-dialog modalAccountRedx',
                        backdrop: 'static',
                        resolve: {
                        }
                    });
                };

                // create brand
                $scope.selectBrand = function (brand) {
                    $scope.dropdownCss.display = 'none';
                    $scope.brandName = brand.name;
                    $scope.selectedBrandId = brand.id;
                    $('#brandNameInp').val($scope.name);
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

                $(document).ready(function() {
                    $('.main_navigation')
                        .find('.active')
                        .removeClass('active')
                        .end()
                        .find('#admin_nav_link')
                        .addClass('active');
                });

                $('#pixelExpirationDate').datepicker('update', new Date());

                _currCtrl.fetchAllAdvertisers();
                _currCtrl.fetchAllBrands();

                $scope.fetchAllBrands = _currCtrl.fetchAllBrands;
                $scope.fetchAllAdvertisers = _currCtrl.fetchAllAdvertisers;
            }
        ]);
    }
);
