define(['angularAMD', 'creative-bulk-controller', 'filter-directive'], function (angularAMD) {
    'use strict';

    angularAMD.controller('CreativeListController', ['$scope', '$rootScope', '$routeParams', '$route', '$timeout', '$location', '$window', 'constants', 'domainReports',
        'workflowService', 'momentService', 'loginModel', 'vistoconfig', 'accountService', 'urlBuilder', 'pageLoad',
        function ($scope, $rootScope, $routeParams, $route, $timeout, $location, $window, constants, domainReports, workflowService,
                  momentService, loginModel, vistoconfig,accountService, urlBuilder, pageLoad) {
            var creativeDataArr,
                winHeight = $(window).height(),
                isSearch = false,
                creativeParams,

                creativeList = {
                    getCreativesList: function (params) {
                        workflowService
                            .getCreativesforCreativeList(params)
                            .then(function (result) {
                                var response = result.data.data;

                                $scope.creativeListLoading = false;
                                $scope.creativesNotFound = false;
                                $scope.loadCreativeData = false;

                                if (response.length > 0) {
                                    if (!$scope.creativeData.creatives || $scope.creativeData.creatives.length === 0) {
                                        $scope.creativeData.creatives = result.data.data;
                                    } else {
                                        $scope.creativeData.creatives = $scope.creativeData.creatives.concat(response);
                                    }
                                } else {
                                    if ($scope.creativeData.creatives.length > 0) {
                                        $scope.creativeLastPage = true;
                                    } else {
                                        $scope.creativesNotFound = true;
                                    }
                                }

                                creativeDataArr = $scope.creativeData.creatives;
                                $scope.defineSize();

                            }, function (error) {
                                console.log('error = ', error);
                            });
                    },

                    getCreativeAds : function (creativeId,index) {
                        workflowService
                            .getCreativeAds(creativeId)
                            .then(function (result) {
                                if (result.status === 'OK' || result.status === 'success') {
                                    $scope.creativeAds.creativeAdData[index] = result.data.data;
                                } else {
                                    creativeList.errorHandler();
                                }
                            });
                    },

                    deleteCreatives : function (clientId, creativeIds) {
                        workflowService
                            .deleteCreatives(clientId,creativeIds)
                            .then(function (result) {
                                if (result.status === 'OK' || result.status === 'success') {
                                    $route.reload();
                                } else {
                                    creativeList.errorHandler();
                                }
                            });
                    },

                    onScrollFetchCreatives :  function () {
                        if ($(window).scrollTop() + $(window).height() === $(document).height() && !$scope.creativeLastPage) {
                            $scope.loadCreativeData = true;
                            $scope.pageNo = $scope.pageNo ? ($scope.pageNo + 1) : 1;
                            creativeParams.pageNo = $scope.pageNo;

                            if (window.location.href.indexOf('creative/list') > -1) {
                                creativeList.getCreativesList(creativeParams);
                            }
                        }
                    },

                    errorHandler: function () {
                        $scope.creativesNotFound = true;
                        $scope.creativeListLoading = false;
                        $scope.creativeData.creatives = [];
                        $scope.creativeData.creatives_count = 0;
                    }
                };

            console.log('CREATIVE LIST controller is loaded!');
            // Hide page loader when the page is loaded
            pageLoad.hidePageLoader();

            $scope.creativeAds = {};
            $scope.creativeAds.creativeAdData = {};
            $scope.showHideToggle = false;
            $scope.creativeData = {};
            $scope.creativeData.creatives = [];
            $scope.pageSize = 20;
            $scope.pageNo = 1;

            $scope.textConstants = constants;
            $scope.adData = {};
            $scope.adData.screenTypes = [];
            $scope.creativeListLoading = true;
            $scope.creativesNotFound = false;
            $scope.creativeLastPage = false;
            $scope.showViewTagPopup = false;
            $scope.edittrue = true;
            $scope.IncorrectTag = false;
            $scope.showDuplicateTagPopup = false;
            $scope.campaignId = $routeParams.campaignId;
            $scope.loadCreativeData = false;
            $scope.deletePopup = false;
            $scope.successfulRecords = [];
            $scope.isCreativeSearched =  false;
            $scope.checkedCreativeArr=[];

            domainReports.highlightHeaderMenu();
            $scope.isLeafNode = accountService.getSelectedAccount().isLeafNode;

            $('.common-load-more').css({
                top: winHeight / 2 - 150,
                position: 'absolute',
                left: '50%',
                margin: '0 0 0 -15px',
                'z-index': '999'
            });

            $scope.redirectAdEditPage=function (adData, creativeData) {
                var url;
                url = urlBuilder.buildBaseUrl() + '/adv/' + creativeData.advertiserId;
                if (adData.adGroupId) {
                    url += '/mediaplan/' + adData.campaignId + '/lineItem/' + adData.lineItemId + '/adGroup/' + adData.adGroupId + '/ads/' + adData.adId +'/edit';
                } else {
                    url += '/mediaplan/' + adData.campaignId + '/ads/' + adData.adId + '/edit';
                }
                $location.url(url);
            };

            $scope.selectAllCreative=function () {
                var i;

                if ($('#select_all_checkbox').prop('checked') === false) {
                    for (i in $scope.creativeData.creatives) {
                        if ($scope.creativeData.creatives[i].pushedCount <= 0) {
                            $scope.creativeData.creatives[i].active=false;
                        }
                    }
                    $scope.checkedCreativeArr = [];
                } else {
                    for (i in $scope.creativeData.creatives) {
                        if ($scope.creativeData.creatives[i].pushedCount <= 0) {
                            $scope.creativeData.creatives[i].active = true;
                        }
                    }

                    $scope.selectedCreativeCheckbox('','allSelected');
                }
            };

            $scope.selectedCreativeCheckbox=function (creative,selectedType) {
                var creativeAlreadySelected,
                    i;

                if (selectedType !== 'allSelected') {
                    creativeAlreadySelected = $scope.checkedCreativeArr.indexOf(creative.id);

                    if (creativeAlreadySelected === -1) {
                        $scope.checkedCreativeArr.push(creative.id);
                    } else {
                        $scope.checkedCreativeArr.splice(Number(creativeAlreadySelected),1);
                    }
                } else {
                    $scope.checkedCreativeArr = [];

                    for (i in $scope.creativeData.creatives) {
                        if ($scope.creativeData.creatives[i].pushedCount <= 0) {
                            $scope.checkedCreativeArr.push($scope.creativeData.creatives[i].id);
                        }
                    }
                }
            };

            $scope.deleteCreatives = function () {
                var postDataObj = {};

                $scope.deletePopup = !$scope.deletePopup;
                postDataObj.idList = $scope.checkedCreativeArr;
                creativeList.deleteCreatives(creativeParams.clientId, postDataObj);
            };

            $scope.cancelDelete = function () {
                if ($scope.checkedCreativeArr.length > 0) {
                    $scope.deletePopup = !$scope.deletePopup;
                }
            };

            $scope.resetAlertMessage = function () {
                localStorage.removeItem('topAlertMessage');
                $rootScope.setErrAlertMessage('', 0);
            };

            $scope.getAdFormatIconName = function (adFormat) {
                var adFormatMapper = {
                    display: 'icon-image',
                    video: 'icon-video',
                    'rich media': 'icon-rich-media',
                    social: 'icon-social',
                    native : 'icon-native'
                };

                adFormat = adFormat || 'display';

                return adFormatMapper[adFormat.toLowerCase()];
            };

            $scope.formatDate = function (date) {
                return moment(date).format('DD MMM YYYY');
            };

            $scope.creativeSearchFunc = function (e) {
                if (!e || e.keyCode === 13) {
                    isSearch = true;
                    creativeParams.query = $scope.creativeSearch;
                    $scope.creativeData.creatives = [];
                    $scope.creativeListLoading = true;
                    $scope.isCreativeSearched = true;
                    $scope.pageNo = creativeParams.pageNo = 1;
                    creativeList.getCreativesList(creativeParams);
                }
            };

            // broadcasted from filter directive once it fetches subaccounts
            $rootScope.$on('filterChanged',function (event, args) {
                creativeParams = args;
                $timeout(function () {
                    $('.searchInputForm input').val('').trigger('blur');
                }, 10);

                isSearch = false;
                $scope.isCreativeSearched = false;
                $scope.creativeListLoading = true;
                $scope.creativeLastPage = false;
                $scope.creativeData.creatives = [];
                args.pageNo = 1;
                args.pageSize = $scope.pageSize;
                creativeList.getCreativesList(args);
            });

            $scope.changeSubAccount =  function (account) {
                var url = '/a/' + $routeParams.accountId + '/sa/' + account.id + '/creative/list';

                $location.url(url);
            };

            $scope.updateCreative = function () {
                var putCrDataObj = {};

                putCrDataObj.name = $scope.selectedCreativeData.name;
                putCrDataObj.tag = $scope.editableTag;
                putCrDataObj.sizeId = $scope.selectedCreativeData.size.id;
                putCrDataObj.creativeFormat = $scope.selectedCreativeData.creativeFormat;
                putCrDataObj.creativeType = $scope.selectedCreativeData.creativeType;
                putCrDataObj.sslEnable = 'true';
                putCrDataObj.updatedAt = $scope.selectedCreativeData.updatedAt;
                $scope.updateForceSaveData = putCrDataObj;

                workflowService
                    .updateCreative($scope.selectedCreativeData.clientId, $scope.selectedCreativeData.advertiserId, $scope.selectedCreativeData.id, putCrDataObj)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.selectedCreativeData.updatedAt = result.data.data.updatedAt;
                            $scope.creativeData.creatives[$scope.selectedCreativePos] = result.data.data;
                            $scope.showViewTagPopup = false;
                        } else if (result.data.data.message === 'Creative with this tag already exists. If you still want to save, use force save') {
                            $scope.showDuplicateTagPopup = true;
                            $scope.IncorrectTag = false;
                        }
                        else {
                            $scope.IncorrectTag = true;
                            $scope.incorrectTagMessage = $scope.textConstants.WF_CREATIVE_TAG_UPDATE_ERROR;
                        }
                    });
            };

            $scope.updateTag = function (context) {
                var PatternOutside = new RegExp(/<script.*>.*(https:).*<\/script>.*/),
                    PatternInside = new RegExp(/<script.*(https:).*>.*<\/script>.*/),
                    tagLower = $scope.editableTag.toLowerCase().replace(' ', '').replace(/(\r\n|\n|\r)/gm, '');

                if (tagLower.match(PatternOutside)) {
                    if ((tagLower.indexOf('%%tracker%%') > -1)) {
                        $scope.updateCreative();
                    } else {
                        $scope.IncorrectTag = true;
                        $scope.incorrectTagMessage =$scope.textConstants.WF_INVALID_CREATIVE_TAG_TRACKER;
                    }
                } else if (tagLower.match(PatternInside)) {
                    if ((tagLower.indexOf('%%tracker%%') > -1)) {
                        $scope.updateCreative();
                    } else {
                        $scope.IncorrectTag = true;
                        $scope.incorrectTagMessage =$scope.textConstants.WF_INVALID_CREATIVE_TAG_TRACKER;
                    }
                } else {
                    context.IncorrectTag = true;
                    context.incorrectTagMessage = $scope.textConstants.WF_INVALID_CREATIVE_TAG;
                }
            };

            $scope.creativeCreate=function () {
                workflowService.setCreativeEditMode('create');
                workflowService.setCreativeEditData(null);
                $location.url(urlBuilder.gotoCreativeUrl());
            };

            $scope.showBulkCreateSection = function () {
                var moreOptCreative = $('.moreOptCreative');

                $('.file_upload_container').slideDown();
                moreOptCreative.find('span').remove();
                moreOptCreative.html('<span class="icon-more-options"></span>');

                // broadCast method for calling adServers for bulk Upload page.
                $scope.$broadcast('bulkUploadSelected', creativeParams);
            };

            $scope.showSuccessBulkUpload = function () {
                $('#formCreativeCreate, .successfullBulkUpView').toggle();
            };

            $scope.hideUploadRecordsMessage = function () {
                $scope.showUploadRecordsMessage = false;
                $scope.successfulRecords = [];
                creativeList.getCreativesList(creativeParams);
            };

            $scope.downloadBulkCreativeErrorFile = function () {
                workflowService
                    .downloadCreativeErrors($scope.errorRecordsFileName)
                    .then(function (response) {
                        if (response.status === 'success') {
                            saveAs(response.file, response.fileName);
                        } else {
                            $scope.downloadBusy = false;
                        }
                    });
            };

            $scope.showRecordList = function () {
                $('.showRecordList, .recordList, .hideRecordList').toggle();
            };

            $scope.ShowHideCreativeWin = function (obj) {
                var url,
                    isLeafNode;

                workflowService.setCreativeEditMode('edit');
                workflowService.setCreativeEditData(obj);
                $scope.$parent.isAddCreativePopup = true;

                url = '/a/' + $routeParams.accountId;
                isLeafNode = accountService.getSelectedAccount().isLeafNode;
                console.log('isLeafNode', isLeafNode);

                if (!isLeafNode) {
                    url += '/sa/' + creativeParams.clientId;
                }

                url += '/creative/' + obj.id + '/edit';
                console.log('url', url);
                $location.url(url);
            };


            $scope.getPreviewUrl = function (creativeData, campaignId, adId) {

                var previewUrl;


                previewUrl = '/a/' + $routeParams.accountId;

                if ($routeParams.subAccountId) {
                    previewUrl += '/sa/' + creativeData.client.id;
                }

                previewUrl +=  '/adv/' + creativeData.advertiserId;

                if (adId) {
                    previewUrl += '/campaign/'+ campaignId + '/ad/' + adId + '/creative/' + creativeData.id + '/preview';
                } else {
                    previewUrl +=  '/creative/' + creativeData.id +'/preview';
                }

                window.open(previewUrl);
            };

            $scope.previewCreative = function (creativeData) {
                $scope.previewCreativeId = creativeData.id;
                $scope.previewCreativeName = creativeData.name;
                $scope.previewCreativeTag = creativeData.tag;
                $window.open(window.location.host + '/creative/' + creativeData.id + '/preview', '_blank');
            };

            $scope.toggleCreativeAds=function (context, creativeId, index, event) {
                var elem = $(event.target);

                if (elem.hasClass('icon-toggleopen')) {
                    elem.removeClass('icon-toggleopen');
                    elem.addClass('icon-toggleclose');
                    elem.closest('.oneDimensionRow').find('.secondDimensionList').hide();
                    elem.closest('.oneDimensionRow').removeClass('visible');

                    if ($('.secondDimensionList:visible').length === 0) {
                        $('.childRowHead').hide();
                    }
                } else {
                    elem.addClass('icon-toggleopen');
                    elem.removeClass('icon-toggleclose');
                    elem.closest('.oneDimensionRow').find('.secondDimensionList').show();
                    elem.closest('.oneDimensionRow').addClass('visible');
                    creativeList.getCreativeAds(creativeId, index);
                    $('.childRowHead').show();
                }
            };

            $scope.utcToLocalTime = function (date, format) {
                return momentService.utcToLocalTime(date, format);
            };

            $scope.enableEditor = function () {
                $scope.editorEnabled = true;
                $scope.editableTag =  $scope.creativeTag;
            };

            $scope.disableEditor = function () {
                $scope.IncorrectTag = false;
                $scope.showViewTagPopup = false;
                $scope.editorEnabled = false;
            };

            $scope.saveDuplicate = function () {
                workflowService
                    .forceSaveCreatives($scope.selectedCreativeData.clientId, $scope.selectedCreativeData.advertiserId, $scope.updateForceSaveData)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.showDuplicateTagPopup = false;
                            $scope.creativeData.creatives[$scope.selectedCreativePos] = result.data.data;
                            $scope.disableEditor();
                        } else {
                            $scope.IncorrectTag = true;
                            $scope.incorrectTagMessage = $scope.textConstants.WF_CREATIVE_FORCESAVE;
                        }
                    });
            };

            $scope.toggleBtn = function (event) {
                var target = $(event.target),
                    parentElem =  target.parents('.miniToggle');

                parentElem
                    .find('label')
                    .removeClass('active');
                target
                    .parent()
                    .addClass('active');
                target.attr('checked', 'checked');
            };

            $scope.cancelDuplicate = function () {
                $scope.showDuplicateTagPopup = false;
                $scope.IncorrectTag = true;
                $scope.incorrectTagMessage = $scope.textConstants.WF_CREATIVE_TAG_UPDATE_ERROR;

                // enable cancel, save button on cancel duplicate
                $scope.disableUpdateCancel = false;
            };

            $('.main_navigation')
                .find('.active')
                .removeClass('active')
                .end()
                .find('#creative_nav_link')
                .addClass('active');

            $('html').css('background', '#fff');
            $('.bodyWrap').css('width', '100%');

            // Search Clear
            $scope.searchHideInput = function () {
                var inputSearch = $('.searchInputForm input');
                isSearch = false;
                inputSearch.val('');

                if ($scope.isCreativeSearched) {
                    $scope.creativeData.creatives = [];
                    $scope.creativeListLoading = true;
                    creativeParams.query = '';
                    creativeParams.pageNo = $scope.pageNo = 1;
                    $scope.isCreativeSearched = false;
                    creativeList.getCreativesList(creativeParams);
                }
            };

            $scope.headerToggle = function () {
                $('.vistoTable .thead .childRow').toggle();
                $('.vistoTable .thead .icon-toggleclose').toggleClass('arrowLookDown');
            };

            $scope.defineSize = function () {
                var listSizeCreativeDataArr = [],
                    i,
                    widthHeight,
                    maxWidth,
                    maxHeight,
                    ratio,
                    width,
                    height,

                    sizeListArr = creativeDataArr.map(function (sizeCreativeDataArr) {
                        if (sizeCreativeDataArr.size) {
                            return  sizeCreativeDataArr.size.size;
                        }
                    });

                listSizeCreativeDataArr = sizeListArr.filter(function (item) {
                    return  typeof item === 'string';
                });


                for (i = 0; i < listSizeCreativeDataArr.length; i++) {
                    widthHeight = listSizeCreativeDataArr[i].split('X');
                    maxWidth = 68 ;
                    maxHeight = 25;
                    ratio = 0;
                    width = widthHeight[0];
                    height =widthHeight[1];

                    $scope.creativeData.creatives[i].width = widthHeight[0];
                    $scope.creativeData.creatives[i].height = widthHeight[1];

                    // Check if the current width is larger than the max
                    if (width > maxWidth) {
                        ratio = maxWidth / width;
                        $scope.creativeData.creatives[i].width = maxWidth;
                        $scope.creativeData.creatives[i].height = height * ratio;
                        height = height * ratio;
                        width = width * ratio;
                    }

                    // Check if current height is larger than max
                    if (height > maxHeight) {
                        ratio = maxHeight / height;
                        $scope.creativeData.creatives[i].height = maxHeight;
                        $scope.creativeData.creatives[i].width =  width * ratio;
                        width = width * ratio;
                        height = height * ratio;
                    }
                }
            };

            // Sticky Header
            $(window).scroll(function () {
                var vistoTable =  $('.vistoTable');

                if (vistoTable.length > 0) {
                    if ($(this).scrollTop() > vistoTable.offset().top) {
                        $('.vistoTable .thead').addClass('sticky');
                        if ($('.thead .childRow:visible').length === 0) {
                            $('.vistoTable .tbody').css('margin-top','64px');
                        } else {
                            $('.vistoTable .tbody').css('margin-top','104px');
                        }
                        if ($('.fixedParent').length > 0) {
                            $('.vistoTable .tbody').css('margin-top','164px');
                        }
                    } else {
                        $('.vistoTable .thead').removeClass('sticky');
                        $('.vistoTable .tbody').css('margin-top','0px');
                    }
                }
            });

            // Pagination
            $(function () {
                $(window).on('scroll', creativeList.onScrollFetchCreatives);
            });

            $scope.$on('$destroy', function () {
                $(window).off('scroll', creativeList.onScrollFetchCreatives);
            });

            // Clear Preview Mouse Out
            $scope.clearHoverPreview = function () {
                $('.hideOption').removeClass('open');
            };
        }]);
});
