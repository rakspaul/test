define(['angularAMD', 'creative-custom-module', 'common-utils', 'creative-drop-down', 'ng-upload-hidden'], function (angularAMD) {
    'use strict';

    angularAMD.controller('CreativeController', ['$scope', '$rootScope', '$routeParams', '$location', 'constants', 'workflowService', 'creativeCustomModule', 'loginModel', 'utils',
        'localStorageService', 'vistoconfig', 'accountService', 'subAccountService', 'advertiserModel', 'urlBuilder', 'pageLoad',
        function ($scope, $rootScope, $routeParams, $location, constants, workflowService, creativeCustomModule, loginModel, utils, localStorageService, vistoconfig,
                  accountService, subAccountService, advertiserModel, urlBuilder, pageLoad) {

        $scope.thirdPartyClickTrackerError = false;
        var postCrDataObj = {},

            processEditCreative = function (clientId) {
                workflowService
                    .getCreativeData(clientId , $scope.creativeId)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.creativeEditData = result.data.data;

                            if ($scope.creativeEditData) {
                                $scope.name = $scope.creativeEditData.name;
                                $scope.advertiserName = $scope.creativeEditData.advertiser.name;
                                $scope.subAccountName = $scope.creativeEditData.client.name;
                                $scope.creative.advertiserId = $scope.creativeEditData.advertiserId;

                                $scope.brandName = $scope.creativeEditData.brand ?
                                    $scope.creativeEditData.brand.name : 'Select Brand';

                                $scope.creative.brandId =
                                    $scope.creativeEditData.brand ? $scope.creativeEditData.brandId : '';

                                $scope.selectedAdServer = $scope.creativeEditData.adServer;

                                $scope.selectedAdServer.id =
                                    $scope.creativeEditData.adServer ? $scope.creativeEditData.adServer.id : '';

                                $scope.creativeFormat = $scope.creativeEditData.creativeFormat;
                                $scope.pushedCount = $scope.creativeEditData.pushedCount;
                                $scope.associatedAdCount = $scope.creativeEditData.noOfAds;
                                $scope.clickUrl = $scope.creativeEditData.clickthroughURL;

                                // make call to set the format type here
                                // in turn makes call to get possible templates
                                $scope.adFormatSelection($scope.creativeFormat,'editCreativeTypeSet');

                                if (!($scope.pushedCount > 0 || $scope.associatedAdCount > 0)) {
                                    resetFormats($scope.selectedAdServer,$scope.creativeAdServers);
                                }

                                // make call to generate Template
                                $scope.creativeEditData.creativeTemplate ?
                                    $scope.onTemplateSelected($scope.creativeEditData.creativeTemplate,
                                        $scope.creativeEditData.creativeCustomInputs,'editCreativeTypeSet') : '';

                                $scope.tag = $scope.creativeEditData.tag;
                                $scope.adData.creativeSize = $scope.creativeEditData.size;

                                $scope.creative.clientId = $scope.creativeEditData.client.id;
                                //tracker
                                if( $scope.creativeEditData.thirdPartyClickTracker){
                                    $scope.toggleCodeField = true;
                                    $scope.adData.thirdPartyClickTracker = $scope.creativeEditData.thirdPartyClickTracker;
                                }

                                if($scope.creativeEditData.thirdPartyTracker){
                                    $scope.toggleCodeField = true;
                                    $scope.adData.thirdPartyTracker =  $scope.creativeEditData.thirdPartyTracker;
                                }

                                $scope.advertisers = advertiserModel.getAdvertiserList();

                                creatives.fetchBrands($scope.creativeEditData.client.id,
                                    $scope.creativeEditData.advertiser.id);
                            }
                        } else {
                            console.log('No data Available to edit');
                        }
                    });
            },

            creatives = {
                // Function to get creatives sizes
                getCreativeSizes: function () {
                    workflowService
                        .getCreativeSizes()
                        .then(function (result) {
                            var responseData;

                            if (result.status === 'OK' || result.status === 'success') {
                                responseData = result.data.data;
                                $scope.creativeSizeData.creativeSize = responseData;
                            } else {
                                creatives.errorHandler(result);
                            }
                        }, creatives.errorHandler);
                },

                fetchAdFormats: function () {
                    $scope.creativeSizeData.adFormats = [
                        {id: 1, name: 'Display',    active: true,  disabled:false},
                        {id: 2, name: 'Video',      active: false, disabled:true},
                        {id: 3, name: 'Rich Media', active: false, disabled:true},
                        {id: 4, name: 'Social',     active: false, disabled:true},
                        {id: 5, name: 'Native',     active: false, disabled:true}

                    ];

                    // default value
                    $scope.adData.adFormat = 'Display';
                },

                fetchCreativeTagTypes: function () {
                    $scope.creativeSizeData.tagTypes = [
                        {id: 1, name: 'HTML', active: false, disabled:false},
                        {id: 2, name: 'JS',   active: false, disabled:false},
                        {id: 3, name: 'VAST', active: false, disabled:false}
                    ];
                },

                errorHandler: function (errData) {
                    console.log(errData);
                },

                fetchAdvertisers: function (clientId) {
                    workflowService
                        .getAdvertisers(clientId, 'write')
                        .then(function (result) {
                            var responseData;

                            if (result.status === 'OK' || result.status === 'success') {
                                responseData = result.data.data;
                                $scope.advertisers = _.sortBy(responseData, 'name');
                            } else {
                                creatives.errorHandler(result);
                            }
                        },  creatives.errorHandler);
                },

                fetchBrands: function (clientId,advertiserId) {
                    workflowService
                        .getBrands(clientId, advertiserId, 'write')
                        .then(function (result) {
                            var responseData;

                            if (result.status === 'OK' || result.status === 'success') {
                                responseData = result.data.data;
                                $scope.brands = _.sortBy(responseData, 'name');
                            } else {
                                creatives.errorHandler(result);
                            }
                        }, creatives.errorHandler);
                }
            },

            reset = {
                advertiser: function () {
                    $scope.creative.advertiserId = '';
                    $scope.advertiserName = 'Select Advertiser';
                },

                brand: function () {
                    $scope.creative.brandId = '';
                    $scope.brandName = 'Select Brand';
                }
            },

            resetTemplate = function () {
                $scope.onTemplateSelected('','');
                $scope.adData.creativeTemplate = '';
            },

            resetAdServer = function () {
                $scope.selectedAdServer = {};
            },

            resetFormats = function (adserver, allAdserverData) {
                var index,
                    i,

                    findAdFormat = function (obj) {
                        return (obj.name).toUpperCase() === angular.uppercase(adserver.formats[i]);
                    };

                // for processeditMode
                if (allAdserverData && allAdserverData.length > 0) {
                    index = _.findIndex(allAdserverData, function (obj) {
                        return Number(obj.id) === Number(adserver.id);
                    });

                    adserver = allAdserverData[index];
                }

                for (i = 0; i < adserver.formats.length; i++) {
                    index = _.findIndex($scope.creativeSizeData.adFormats, findAdFormat);

                    if (index >= 0) {
                        $scope.creativeSizeData.adFormats[index].disabled = false;
                    } else {
                        $scope.creativeSizeData.adFormats[index].disabled = true;
                    }
                }
            },

            //  Get all adserver in Creative Library Page
            getAdServersInLibraryPage = function (clientId, advertiserId, brandId) {
                var responseData = '';

                workflowService
                    .getVendorsAdServer(clientId, advertiserId, brandId)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            responseData = result.data.data;
                            $scope.creativeAdServers = responseData;

                            if(!$scope.adPage) {
                                $scope.creativeSizeData.adFormats = [
                                    {id: 1, name: 'Display',    active: false, disabled: true},
                                    {id: 2, name: 'Video',      active: false, disabled: true},
                                    {id: 3, name: 'Rich Media', active: false, disabled: true},
                                    {id: 4, name: 'Social',     active: false, disabled: true},
                                    {id: 5, name: 'Native',     active: false, disabled: true}

                                ];
                            }

                            if ($scope.creativeMode === 'edit') {
                                processEditCreative(responseData.clientId);
                            }
                        } else {
                            console.log('failed to get template Json');
                            creatives.errorHandler(result);
                        }
                    });

            };

        console.log('CREATIVE controller is loaded!');
        // Hide page loader when the page is loaded
        pageLoad.hidePageLoader();

        $scope.creative = {};
        $scope.adData = {};
        $scope.textConstants = constants;
        $scope.mode = workflowService.getMode();
        $scope.workflowData = {};
        $scope.newData = {};
        $scope.adData.screenTypes = [];
        $scope.selectedCreative = {};
        $scope.creativeSizeData = {};
        $scope.selectedAdServer = {};
        $scope.addedSuccessfully = false;
        $scope.IncorrectTag = false;
        $scope.disableCancelSave = false;
        $scope.campaignId = $routeParams.campaignId;
        $scope.showSubAccount = false;
        $scope.IncorrectClickThru=false;
        $scope.creativeId = $routeParams.creativeId;
        localStorage.setItem('isOnchangeOfCreativeFeild', 0);

        $scope.creativeTagSelected = function (event, creativeType) {
            var target;

            if (event) {
                target = $(event.target);
                target.closest('.goalBtnWithPopup').find('label').removeClass('active');
                target.parent().addClass('active');
                target.attr('checked', 'checked');
            }

            $scope.creativeType = creativeType.toUpperCase();
        };

        $scope.data = {
            availableOptions: [
                {id: '1', name: 'Option A'},
                {id: '2', name: 'Option B'},
                {id: '3', name: 'Option C'}
            ]
        };

        //  Ad Format Type
        $scope.formatLabel = 'Display';

        $scope.getAdFormatIconName = function (adFormat) {
            var adFormatMapper = {
                display: 'image',
                video: 'video',
                'rich media': 'rich-media',
                social: 'social',
                native : 'native'
            };

            return adFormatMapper[adFormat.toLowerCase()];
        };



        $scope.selectHandler = function (type, data) {
            switch (type) {
                case 'advertiser':
                    $scope.brands = {};
                    $scope.advertiserName = data.name;
                    $scope.creative.brandId = '';
                    $scope.creative.advertiserId = data.id;
                    creatives.fetchBrands($scope.creative.clientId, data.id);
                    $scope.brandName = 'Select Brand';
                    $scope.selectedAdServer = {};

                    //update vendorConfig
                    getAdServersInLibraryPage($scope.creative.clientId, $scope.creative.advertiserId);
                    break;

                case 'brand':
                    $scope.brandName = data.brandName;
                    $scope.creative.brandId = data.brandId;
                    $scope.selectedAdServer = {};

                    //update vendorConfig
                    getAdServersInLibraryPage($scope.creative.clientId, $scope.creative.advertiserId, $scope.creative.brandId);
                    break;
            }
        };

        $scope.changeSubAccount =  function(account) {
            var url = '/a/' + $routeParams.accountId+'/sa/'+ account.id +'/creative/add';
            $location.url(url);
        };

        //  function on adFormat selected
        $scope.adFormatSelection = function (adFormatName, flag) {
            var index = _.findIndex($scope.creativeSizeData.adFormats, function (obj) {
                    return (obj.name).toUpperCase() === (adFormatName).toUpperCase();
                }),

                i;

            for (i in $scope.creativeSizeData.adFormats) {
                $scope.creativeSizeData.adFormats[i].active = false;

                if ((!$scope.adPage) && ($scope.creativeMode === 'edit') &&
                    ($scope.pushedCount > 0 || $scope.associatedAdCount > 0)) {
                    $scope.creativeSizeData.adFormats[i].disabled = true;
                }
            }

            if (index >= 0) {
                $scope.creativeSizeData.adFormats[index].active = true;
            }

            $scope.creativeFormat = angular.uppercase(adFormatName);

            //  CreativeLibrary page, get templates
            if (!$scope.adPage && $scope.selectedAdServer) {
                resetTemplate();

                //  In edit mode, do not let to change templateType from full-tracking or vice versa if ads count > 0.
                if ($scope.creativeMode === 'edit' && $scope.associatedAdCount > 0) {
                    $scope.getTemplates($scope.selectedAdServer,adFormatName);
                } else {
                    $scope.getTemplates($scope.selectedAdServer,adFormatName);
                }
            }

            if (flag !== 'editCreativeTypeSet') {
                $scope.creativeType = '';
                $('.creativeType').find('label').removeClass('active');

                $scope.creativeSizeData.tagTypes = [
                    {id: 1, name: 'HTML', active: false, disabled:false},
                    {id: 2, name: 'JS',   active: false, disabled:false},
                    {id: 3, name: 'VAST', active: false, disabled:false}
                ];
            }
        };

        //  function on AdServer Selected*/
        $scope.adServerSelected = function (adServer) {
            //  used in adFormatSelection function to get all templates.
            $scope.selectedAdServer = adServer;

            if (!$scope.adPage) {
                resetFormats(adServer);
            }

            if (!$scope.adPage && $scope.creativeFormat) {
                resetTemplate();
                $scope.getTemplates($scope.selectedAdServer,$scope.creativeFormat);
            }

            //  function to get the possible templates in adCreate Page)
            if ($scope.adPage) {
                $scope.getTemplates(adServer,$scope.creativeFormat, workflowService.getVendorExecutionType());
            }
        };

        // get Templates
        $scope.getTemplates = function (vendor, format, executionVendorType) {
            var responseData;

            workflowService
                .getTemplates(vendor, format, executionVendorType)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        responseData = result.data.data;

                        /*In creative library page, in edit mode, if ads count for a creative>0,
                         allow template change between same type. if its pushed, disable the template selection*/
                        if($scope.creativeMode === 'edit' && !$scope.adPage && $scope.associatedAdCount > 0){
                            var tempArr=_.filter(responseData,function (obj) {
                                return obj.templateType === $scope.creativeEditData.creativeTemplate.templateType;
                            });

                            $scope.creativeTemplates = tempArr;
                        }else{
                            $scope.creativeTemplates=responseData;
                        }

                    } else {
                        console.log('failed to get Channels');
                        creatives.errorHandler(result);
                    }
                }, creatives.errorHandler);
        };

        $scope.$on('EditAdResponseData',function () {
            creatives.fetchAdFormats();
        });

        // This function is triggered when adFormat is changes in SelectType page of Ad create
        $scope.$on('adFormatChanged', function (event, adType) {
            var index = _.findIndex($scope.creativeSizeData.adFormats, function (obj) {
                    return angular.uppercase(obj.name) === angular.uppercase(adType);
                }),

                i,
                responseData;

            for (i in $scope.creativeSizeData.adFormats) {
                $scope.creativeSizeData.adFormats[i].active = false;
                $scope.creativeSizeData.adFormats[i].disabled = true;
            }

            if (index >= 0) {
                $scope.creativeSizeData.adFormats[index].active = true;
                $scope.creativeSizeData.adFormats[index].disabled = false;
            }

            $scope.creativeFormat = angular.uppercase(adType);

            // function to get the possible ad servers for the adFormat selected
            // (Create Ad flow, format is prefilled in this case)
            workflowService
                .getAdServers($scope.creativeFormat)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        responseData = result.data.data;
                        $scope.creativeAdServers = responseData;
                    } else {
                        creatives.errorHandler(result);
                    }
                }, creatives.errorHandler);
        });

        // Generate the Template
        $scope.onTemplateSelected = function (templateJson, customFieldsDataEditMode) {
            var creativeTemplateWrap = $('.creativeTemplate'),
                i,
                supportedList,
                inputElements;

            $scope.creativeSizeData.tagTypes = [];
            $scope.CreativeTemplate = templateJson;
            $scope.templateType = templateJson.templateType;
            $scope.adData.creativeTemplate = templateJson.id;

            if (templateJson) {
                supportedList = '';

                for (i = 0; i < templateJson.supportedTags.length; i++) {
                    supportedList = (supportedList.length > 0) ?
                        (supportedList + ',' + templateJson.supportedTags[i]) : templateJson.supportedTags[i];
                }

                if (templateJson.creativeTemplateCustomInputJson &&
                    templateJson.creativeTemplateCustomInputJson.platformCustomInputNamespaceList[0] &&
                    templateJson.creativeTemplateCustomInputJson.platformCustomInputNamespaceList[0].platformCustomInputGroupList &&
                    templateJson.creativeTemplateCustomInputJson.platformCustomInputNamespaceList[0].platformCustomInputGroupList.length > 0) {
                    inputElements = templateJson.creativeTemplateCustomInputJson.platformCustomInputNamespaceList[0]
                        .platformCustomInputGroupList;

                    for (i = 0; i < inputElements.length; i++) {
                        if (inputElements[i].name === 'tag_types' && inputElements[i].platformCustomInputList) {
                            inputElements[i].platformCustomInputList[0].supportedTags=supportedList;
                        }
                    }
                }

                templateJson
                    .creativeTemplateCustomInputJson
                    .platformCustomInputNamespaceList[0]
                    .platformCustomInputGroupList = inputElements;
            }

            creativeCustomModule.init(templateJson, creativeTemplateWrap, $scope, customFieldsDataEditMode);
            creativeTagTemplateLoaded();
        };

        // Purpose: This method will get invoked once the template(Creative tag, Type,
        // ClickThorugh URL) elements are loaded
        function creativeTagTemplateLoaded() {
            validateCreativeTag();
        }

        // Purpose: Bind the event to the textarea on the creative tag
        // on leaving the focus fire the API to validate
        function validateCreativeTag() {
            var ele = $('textarea[name*="tags.tag"]'),
                val = ele.val();

            if (($scope.creativeMode === 'edit') && val) {
                fireAPItoValidate(ele, val);
            }

            ele.on('change', function () {
                localStorage.setItem('isOnchangeOfCreativeFeild', 1);
                val = $(this).val();
                fireAPItoValidate(this, val);
            });
        }

        function fireAPItoValidate(ele, creativeTag) {
            var creativeValidateObj = {
                    advertiserId : $scope.creative.advertiserId,
                    clientId : vistoconfig.getMasterClientId(),
                    data: {
                        tag: creativeTag,
                        format: $scope.creativeFormat
                    }
                };

            $(ele).next('.errorText, .creativePreviewBtn').remove();
            workflowService
                .validateCreative(creativeValidateObj)
                .then(function (res) {
                    var url,
                        appendEle,
                        responseData;

                    if (res.status === 'OK' || res.status === 'success') {
                        responseData = res.data.data;

                        localStorageService.creativeTag.set({
                            tag: responseData.tag,
                            creativeType: creativeValidateObj.data.format
                        });

                        url = urlBuilder.goToPreviewUrl(creativeValidateObj);

                        appendEle = '<div class="creativePreviewBtn"><a target="_blank" href="' +
                            url +'">Preview</a></div>';

                        $(ele).after(appendEle);
                    }
                }, function () {});
        }

        $scope.creativePopularSizes = [
            {id: 16, size: '300x250'},
            {id: 7,  size: '160x600'},
            {id: 34, size: '728x90'},
            {id: 18, size: '300x600'},
            {id: 20, size: '320x50'}
        ];

        $scope.resetAlertMessage = function () {
            $rootScope.setErrAlertMessage('', 0);
        };

        $scope.init = function () {

            if ($routeParams.creativeId) {
                $scope.isAddCreativePopup = true;
                $scope.creativeMode = 'edit';
            } else {
                $scope.creativeMode = 'create';
            }


            if ($location.path().endsWith('/creative/add')) {
                $scope.isAddCreativePopup = true;
                $('html').css('background', '#fff');

                $('.main_navigation')
                    .find('.active')
                    .removeClass('active')
                    .end()
                    .find('#creative_nav_link')
                    .addClass('active');
            }

            $scope.adPage = $scope.campaignId ? true : false;
            console.log('$scope.adPage', $scope.adPage);

            var accountData = accountService.getSelectedAccount(),
                selectedSubAccount =  subAccountService.getSelectedSubAccount(),
                clientId = accountData.id,
                selectedAdvertiser;

            if (!accountData.isLeafNode) {
                $scope.showSubAccount = true;
                $scope.subAccounts = subAccountService.getSubAccounts();
                $scope.subAccountName = selectedSubAccount.displayName;
                clientId = selectedSubAccount.id;
                $scope.subAccountId =  $scope.creative.clientId = clientId;
            }


            if ($scope.adPage) {
                selectedAdvertiser = advertiserModel.getSelectedAdvertiser();
                $scope.advertiserName = selectedAdvertiser.name;
                $scope.creative.advertiserId = selectedAdvertiser.id;
                creatives.fetchBrands(clientId, selectedAdvertiser.id);
            }


            creatives.getCreativeSizes();
            creatives.fetchCreativeTagTypes();

            if ($scope.mode !== 'edit' && $scope.adPage) {
                creatives.fetchAdFormats();
                $scope.$broadcast('adFormatChanged', 'DISPLAY');
            }

            if (!$scope.adPage) {
                if($routeParams.advertiserId) {
                    selectedAdvertiser = advertiserModel.getSelectedAdvertiser();
                    $scope.advertiserName = selectedAdvertiser.name;
                    $scope.creative.advertiserId = selectedAdvertiser.id;
                    $scope.advertisers = advertiserModel.getAdvertiserList();
                    creatives.fetchBrands(clientId, selectedAdvertiser.id);
                } else {
                    creatives.fetchAdvertisers(clientId);
                    reset.advertiser();
                    reset.brand();
                }
            }

            getAdServersInLibraryPage(clientId);
        };

        $scope.init();

        $scope.submitForm = function (form) {
            var formData,
                indexArr = [],
                formDataObj,
                validCreativeUrl,
                validtThirdPartyClickTrackerUrl,
                validateTag,
                i,
                templateArr,
                creativeCustomInputsArr,

            // list of data which should not be included in creativeCustomInputsArr Array.
                listArr = [
                    'name',
                    'subAccountId',
                    'advertiserId',
                    'brandId',
                    'adFormat',
                    'creativeFormat',
                    'sslEnable',
                    'creativeAdServer',
                    'creativeTemplate',
                    'tag',
                    'creativeSize',
                    'creativeType',
                    'clickUrl',
                    'thirdPartyTracker',
                    'thirdPartyClickTracker'
                ];

            $scope.$broadcast('show-errors-check-validity');

            if (form.$valid) {
                formDataObj = $('#formCreativeCreate').serializeArray();
                formData = _.object(_.pluck(formDataObj, 'name'), _.pluck(formDataObj, 'value'));
                postCrDataObj = {};
                postCrDataObj.name = formData.name;
                postCrDataObj.clientId = $scope.creative.clientId;
                postCrDataObj.advertiserId = formData.advertiserId;
                postCrDataObj.brandId = formData.brandId;
                postCrDataObj.adServerId = formData.creativeAdServer;
                postCrDataObj.creativeFormat = $scope.creativeFormat.toUpperCase();
                postCrDataObj.sslEnable = 'true';
                postCrDataObj.sizeId = formData.creativeSize ? formData.creativeSize :'';
                postCrDataObj.creativeTemplateId = formData.creativeTemplate;
                postCrDataObj.creativeCustomInputs=[];
                postCrDataObj.thirdPartyTracker = formData.thirdPartyTracker;
                postCrDataObj.thirdPartyClickTracker = '';

                validCreativeUrl = true;
                validateTag=true;
                validtThirdPartyClickTrackerUrl = true;

                if (formData.thirdPartyClickTracker && formData.thirdPartyClickTracker !== '') {
                    // validate if the url is valid
                    validtThirdPartyClickTrackerUrl = utils.validateUrl(formData.thirdPartyClickTracker);
                    if (validtThirdPartyClickTrackerUrl === false) {
                        $scope.thirdPartyClickTrackerError = true;
                    } else {
                        $scope.thirdPartyClickTrackerError = false;
                        postCrDataObj.thirdPartyClickTracker = formData.thirdPartyClickTracker;
                    }

                }


                $('#invalidUrl').remove();
                $('#invalidScript').remove();

                for (i = 0; i < formDataObj.length; i++) {
                    if (listArr.indexOf(formDataObj[i].name) >= 0) {
                        // contains all indexes of static Markup which will have to be removed
                        // before adding to the list.
                        indexArr.push(i);
                    }
                }
                // Arr of objects of template HTML, which needs to be sent in the List in post Json
                templateArr = $.grep(formDataObj, function (n, i) {
                    return $.inArray(i, indexArr) === -1;
                });
                $scope.IncorrectTag = false;
                creativeCustomInputsArr= _.map(templateArr, function (data) {
                    var d = data.name.split('$$');

                    if (d[0] === 'clickthrough_url.clickthrough_url' && data.value !== '') {
                       // validate if the url is valid
                       validCreativeUrl = utils.validateUrl(data.value);
                       if (validCreativeUrl === false) {
                           $('[name = "' + data.name + '"]')
                               .parent()
                               .append('<label id="invalidUrl" ' +
                                   'class="col-sm-12 control-label errorLabel" ' +
                                   'style="display: block">Please enter a valid url.</label>');
                       }
                    }


                    if (d[0]=== 'tags.tag' ) {
                        // validate if the url is valid
                        if (data.value === '') {
                            validateTag=false;

                            $('[name = "' + data.name + '"]')
                                .parent()
                                .append('<label id="invalidScript" ' +
                                    'class="col-sm-12 control-label errorLabel" ' +
                                    'style="display: block">Please enter a Script tag.</label>');
                        } else {
                            validateTag = utils.validateTag(data.value);

                            if (validateTag === false) {
                                $('[name = "' + data.name + '"]')
                                    .parent()
                                    .append('<label id="invalidScript" ' +
                                        'class="col-sm-12 control-label errorLabel" ' +
                                        'style="display: block">Please enter a valid Script tag.</label>');
                            }
                        }
                    }

                    if (data.value !== '') {
                        return {
                            creativeCustomInputId: Number(d[1]),
                            value: data.value
                        };
                    }
                });

                if (validCreativeUrl && validateTag && validtThirdPartyClickTrackerUrl && !$scope.thirdPartyClickTrackerError ) {
                    _.each(creativeCustomInputsArr,function (obj) {
                        if (obj) {
                            postCrDataObj.creativeCustomInputs.push(obj);
                        }
                    });

                    $scope.creativeSave(postCrDataObj);
                }
            }
        };

        $scope.creativeSave = function (postCrDataObj) {
            $scope.IncorrectTag = false;
            $scope.savingCreative = true;
            $scope.CrDataObj = postCrDataObj;

            if ($scope.creativeMode !== 'edit' || $scope.adPage) {
                workflowService
                    .saveCreatives($scope.creative.clientId, postCrDataObj)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.addedSuccessfully = true;
                            $scope.Message = 'Creative Added Successfully';
                            $scope.savingCreative = false;

                            if (result.data.data.creativeState === 'READY') {
                                workflowService.setNewCreative(result.data.data);
                            }

                            // redirect user after successful saving
                            $scope.cancelBtn();

                            $rootScope.setErrAlertMessage($scope.textConstants.CREATIVE_SAVE_SUCCESS, 0);
                            vistoconfig.defaultMessage.set({message : $scope.textConstants.CREATIVE_SAVE_SUCCESS});
                        } else if (result.status === 'error') {
                            $scope.savingCreative = false;
                            $scope.Message = result.data.data.message || 'Unable to create Creative';
                            $scope.partialSaveAlertMessage = true;
                            $rootScope.setErrAlertMessage($scope.Message, 1);
                        } else if (result.data.data.message ===
                            'Creative with this tag already exists. If you still want to save, use force save') {
                            $('.popup-holder').css('display', 'block');
                            $scope.savingCreative = false;
                            $scope.disableCancelSave = true;
                        } else {
                            $scope.savingCreative = false;
                            $scope.Message = 'Unable to create Creative';
                            $scope.partialSaveAlertMessage = true;
                            $rootScope.setErrAlertMessage($scope.Message,1);
                        }
                    });
            } else {
                postCrDataObj.updatedAt = $scope.creativeEditData.updatedAt;

                workflowService
                    .updateCreative($scope.creative.clientId, $scope.creativeEditData.advertiserId,
                        $scope.creativeEditData.id,postCrDataObj)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.addedSuccessfully = true;
                            $scope.Message = 'Creative Added Successfully';

                            // redirect user after successful saving
                            $scope.cancelBtn();
                            $rootScope.setErrAlertMessage($scope.textConstants.CREATIVE_SAVE_SUCCESS, 0);
                           // localStorage.setItem( 'topAlertMessage', $scope.textConstants.CREATIVE_SAVE_SUCCESS);
                            vistoconfig.defaultMessage.set({message : $scope.textConstants.CREATIVE_SAVE_SUCCESS});
                        } else {
                            $scope.addedSuccessfully = true;
                            $scope.Message = 'Unable to create Creatives';
                            console.log(result);
                        }
                    });
            }
        };

        $scope.$on('creativeAdserverTemplateReset', function () {
            resetAdServer();
            resetTemplate();
        });

        $scope.$on('closeAddCreativePage', function () {
            var url;

            $('#formCreativeCreate')[0].reset();
            $scope.IncorrectTag = false;
            $scope.addedSuccessfully = false;
            $('#formatType').html('Select Format<span class="icon-arrow-solid-down"></span>');
            $('#creativeSize').html('Select Size<span class="icon-arrow-solid-down"></span>');
            $scope.$broadcast('show-errors-reset');

            if ($location.path().endsWith('/creative/add') || ($scope.creativeMode === 'edit' && !$scope.adPage)) {
                url = urlBuilder.buildBaseUrl($routeParams.accountId, $routeParams.subAccountId, $routeParams.advertiserId, -1) + '/creative/list';
                $location.url(url);

            } else {
                $('.newCreativeSlide .popCreativeLib')
                    .delay(300)
                    .animate({
                        left: '100%',
                        marginLeft: '0px'
                    }, 'slow', function () {
                        $(this).hide();
                    });

                $('#creative')
                    .delay(300)
                    .animate({
                        height: 'auto'
                    }, 'slow');
            }
        });

        $scope.cancelBtn = function () {
            var winHeight = $(window).height() - 126;

            if ($scope.adPage) {
                $rootScope.$broadcast('creativePopUpClosed');
            }
            $scope.creativeTemplates={};
            $scope.adData.creativeSize? $scope.adData.creativeSize.size='Select Size':'';
            $scope.adData.creativeSize? $scope.adData.creativeSize.id=undefined:'';

            $scope.$broadcast('closeAddCreativePage');
            $('.adStepOne .tab-pane').css('min-height', winHeight - 30 + 'px');
        };

        $rootScope.$on('hideCreativeWin', function () {
            $scope.cancelBtn();
        });

        $scope.switchPlatform = function () {
            $rootScope.$broadcast('switchPlatformFunc');
        };

        $scope.saveDuplicate = function () {
            workflowService
                .forceSaveCreatives($scope.campaignId, $scope.advertiserId, $scope.CrDataObj)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $('.popup-holder').css('display', 'none');
                        $scope.disableCancelSave = false;
                        workflowService.setNewCreative(result.data.data);
                        $scope.cancelBtn();
                    } else {
                        $scope.addedSuccessfully = true;
                        $scope.Message = 'Unable to create Creatives';
                    }
                });
        };

        $scope.dropBoxItemSelected =  function (item, type) {
            $('#listBoxSize')
                .parents('.dropdown')
                .removeClass('open');

            $('[name="creativeFormat"]')
                .prev('.dropdown')
                .removeClass('open');

            $scope.adData[type] = item;
            $scope.newData[type] = '';
        };

        $scope.cancelDuplicate = function () {
            $('.popup-holder').css('display', 'none');
            $scope.addedSuccessfully = true;
            $scope.Message = 'Unable to create Creatives';

            // enable cancel, save button on cancel duplicate
            $scope.disableCancelSave = false;
            $scope.savingCreative=false;
        };

        $scope.toggleBtn = function (event) {
            var target = $(event.target),
                parentElem =  target.parents('.miniToggle');

            parentElem
                .find('label')
                .removeClass('active');

            target
                .parent()
                .addClass('active')
                .attr('checked', 'checked');
        };

        $('.dropdown-menu li a').click(function () {
            var selText = $(this).text();

            $(this)
                .parents('.btn-group')
                .find('.dropdown-toggle')
                .html('<span>' + selText + '</span> <span class="caret"></span>');
        });

        // DDL Search Input Prevent Default
        $('.dropdown-menu')
            .find('input')
            .click(function (e) {
                e.stopPropagation();
            });

        // DDL with Search
        $('.dropdown-menu-search li a').click(function () {
            var selText = $(this).text();

            $(this)
                .parents('.btn-group')
                .find('.dropdown-toggle-search')
                .attr('value=' + selText);
        });
        $scope.$on('$locationChangeSuccess', function () {
            localStorage.setItem('isOnchangeOfCreativeFeild', 0);
        });

        $scope.clickTrackingBox = function(){
            $scope.toggleCodeField = !$scope.toggleCodeField;
            if($scope.toggleCodeField ){
                $rootScope.setErrAlertMessage(constants.CAUTION_MSG, '','','warning');
            } else {
                $scope.adData.thirdPartyTracker = '';
                $scope.adData.thirdPartyClickTracker = '';
            }
        };


    }]);
});
