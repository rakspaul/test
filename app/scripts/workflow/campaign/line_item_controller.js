define(['angularAMD', 'file-reader', 'ng-upload-hidden'], function (angularAMD) {
    'use strict';

    angularAMD.controller('LineItemController', ['$scope', '$rootScope', '$routeParams', '$locale', 'vistoconfig',
        '$location', '$timeout', 'constants', 'workflowService', 'loginModel',
        'momentService', 'fileReader', 'Upload', 'dataService', function ($scope, $rootScope, $routeParams, $locale, vistoconfig,
                                                          $location, $timeout, constants, workflowService, loginModel,
                                                          momentService, fileReader, Upload, dataService) {
        var selectedAdvertiser,
            campaignId = '-999',
            CONST_FLAT_FEE = 'Flat Fee',
            CONST_COGS_PERCENT = 'COGS+ %',
            CONST_COGS_CPM = 'COGS + CPM Markup',
            CONST_POST_IMPRESSION_CPA = 'Post-Impression CPA',
            CONST_TOTAL_CPA = 'Total CPA',
            CONST_POST_CLICK_CPA = 'Post-Click CPA',
            oldLineItem,
            oldLineItemIndex,
            lineItemAPIEndTimeList = [],
            lineItemAPIStartTimeList = [],

            validateMediaPlanDates = function () {
                var startDatelow = [],
                    endDateHigh = [],
                    ascending,
                    descending,
                    i,
                    lowestStartTime,
                    ind,
                    startDateElem = $('#startDateInput'),
                    endDateElem = $('#endDateInput'),
                    highestEndTime;

                // startDate input Element
                if (!_.contains(['IN_FLIGHT', 'ENDED'], $scope.selectedCampaign.status)) {
                    for (i in $scope.lineItems.lineItemList) {
                        if ($scope.lineItems.lineItemList[i].startTime) {
                            startDatelow.push($scope.lineItems.lineItemList[i].startTime);
                        }
                    }

                    // method to find lowest startTime
                    ascending = _.sortBy(startDatelow, function (o) {
                        return o;
                    });

                    if (ascending.length > 0) {
                        lowestStartTime = ascending[0];
                        startDateElem.datepicker('setEndDate', lowestStartTime);
                    } else {
                        startDateElem.datepicker('setStartDate', $scope.selectedCampaign.startTime);
                        startDateElem.datepicker('setEndDate', $scope.selectedCampaign.endTime);
                    }
                }

                // endDate input Element
                for (ind in $scope.lineItems.lineItemList) {
                    if ($scope.lineItems.lineItemList[ind].endTime) {
                        endDateHigh.push($scope.lineItems.lineItemList[ind].endTime);
                    }
                }

                descending = _.sortBy(endDateHigh, function (o) {
                    return o;
                });

                descending.reverse();

                if (descending.length > 0) {
                    highestEndTime = descending[0];
                    endDateElem.datepicker('setStartDate', highestEndTime);
                } else {
                    endDateElem.datepicker('setStartDate',$scope.selectedCampaign.endTime);
                }
            },

            resetSuccessErrorCount=function () {
                $scope.successfulLineItemCount = 0;
                $scope.errorLineItemCount = 0;
            },

            lineItemCreateBulkUpload=function () {
                var index,
                    errorFound,
                    newItem,
                    objectIndex,
                    indexSor,

                    findBillingType = function (type) {
                        return type.id === $scope.correctLineItems[index].billingTypeId;
                    },

                    findPixel = function (type) {
                        return type.id === $scope.correctLineItems[index].pixelId;
                    },

                    findVendorConfig = function (type) {
                        return type.id === $scope.correctLineItems[index].vendorConfigId;
                    };

                for (index = 0; index < $scope.correctLineItems.length; index++) {
                    errorFound = false;
                    newItem = {};
                    newItem.lineItemType={};
                    newItem.name = $scope.correctLineItems[index].name;

                    objectIndex = _.findIndex($scope.type, findBillingType);

                    if (objectIndex >= 0) {
                        newItem.lineItemType = $scope.type[objectIndex];
                    }

                    newItem.pricingMethodId = $scope.correctLineItems[index].billingTypeId;
                    newItem.adGroupName = $scope.correctLineItems[index].adGroupName;
                    newItem.billableAmount = $scope.correctLineItems[index].billableAmount;
                    newItem.volume = $scope.correctLineItems[index].volume;
                    newItem.pricingRate = Number($scope.correctLineItems[index].billingRate);
                    newItem.startTime = momentService.utcToLocalTime($scope.correctLineItems[index].startTime);
                    newItem.endTime = momentService.utcToLocalTime($scope.correctLineItems[index].endTime);

                    if (newItem.startTime < $scope.selectedCampaign.startTime ||
                        newItem.endTime > $scope.selectedCampaign.endTime) {
                        $scope.successfulLineItemCount=$scope.successfulLineItemCount-1;
                        $scope.errorLineItemCount=$scope.errorLineItemCount+1;
                        errorFound=true;
                    }

                    newItem.campaignId = (campaignId === '-999') ? '-999' : campaignId;

                    if ($scope.correctLineItems[index].pixelId) {
                        objectIndex = _.findIndex($scope.selectedCampaign.pixelList, findPixel);
                        newItem.pixel = $scope.selectedCampaign.pixelList[objectIndex];
                        newItem.pixelId = $scope.selectedCampaign.pixelList[objectIndex].id;
                    }

                    if ($scope.correctLineItems[index].vendorConfigId) {
                        indexSor = _.findIndex($scope.selectedCampaign.systemOfRecord, findVendorConfig);
                        newItem.systemOfRecordSelected = $scope.selectedCampaign.systemOfRecord[indexSor];
                        newItem.vendorConfigId = $scope.selectedCampaign.systemOfRecord[indexSor].id;
                    }

                    if (doesLineItemExceedBudget(newItem.billableAmount, $scope.Campaign.totalBudget)) {
                        $scope.successfulLineItemCount=$scope.successfulLineItemCount-1;
                        $scope.errorLineItemCount=$scope.errorLineItemCount+1;
                        errorFound=true;
                    }

                    if (!errorFound) {
                        $scope.lineItems.lineItemList.push(newItem);
                        validateMediaPlanDates();
                        $scope.calculateLineItemTotal();
                    }
                }
            };

        function createLineItemObj(lineItemObj) {
            var newItem = {};

            newItem.name = $scope.lineItemName;
            newItem.lineItemType = $scope.lineItemType;
            newItem.pricingMethodId = $scope.lineItemType.id;

            if ($scope.hideAdGroupName) {
                newItem.adGroupName = '';
            } else {
                newItem.adGroupName = ($scope.adGroupName === '') ? $scope.lineItemName : $scope.adGroupName;
            }

            newItem.billableAmount = $scope.billableAmount;
            newItem.volume = $scope.volume;
            // newItem.volumeType = $scope.selectedVolumeType;

            if($scope.selectedVolumeType){
                newItem.volumeType = $scope.selectedVolumeType;
            }

            // in case pricerate is 30% markup remove the Markup
            if (typeof $scope.pricingRate === 'string') {
                newItem.pricingRate = Number($scope.pricingRate.split('%')[0]);
            } else {
                newItem.pricingRate = $scope.pricingRate;
            }

            newItem.startTime = $scope.lineItemStartDate;
            newItem.endTime = $scope.lineItemEndDate;

            if ($scope.pixelSelected) {
                newItem.pixel = $scope.pixelSelected;
                newItem.pixelId = $scope.pixelSelected.id;
            }

            if ($scope.systemOfRecordSelected) {
                newItem.systemOfRecordSelected = $scope.systemOfRecordSelected;

                // vendorConfigId is the parameter backend acceptes
                newItem.vendorConfigId = $scope.systemOfRecordSelected.id;
            }

            newItem.campaignId = campaignId;

            // this is in case of edit mode where line item has id
            if (lineItemObj) {
                newItem.id = lineItemObj.id;
                newItem.updatedAt = lineItemObj.updatedAt;
                newItem.hasInFlightAds = lineItemObj.hasInFlightAds;
            }

            $scope.calculateLineItemTotal();
            return newItem;
        }

        function createEditLineItemObj(lineItemObj) {
            var newItem = {};

            newItem.name = $scope.editLineItem.lineItemName;
            newItem.lineItemType = $scope.editLineItem.lineItemType;
            newItem.pricingMethodId = $scope.editLineItem.lineItemType.id;
            newItem.adGroupName = $scope.editLineItem.adGroupName;
            newItem.billableAmount = $scope.editLineItem.billableAmount;
            newItem.volume = $scope.editLineItem.volume;
            newItem.volumeType = $scope.editLineItem.selectedVolumeType;

            if($scope.editLineItem.selectedVolumeType){
                newItem.volumeType = $scope.editLineItem.selectedVolumeType;
            }

            // in case pricerate is 30% markup remove the Markup
            if (typeof $scope.editLineItem.pricingRate === 'string') {
                newItem.pricingRate = Number($scope.editLineItem.pricingRate.split('%')[0]);
            } else {
                newItem.pricingRate = $scope.editLineItem.pricingRate;
            }

            newItem.startTime = $scope.editLineItem.startTime;
            newItem.endTime = $scope.editLineItem.endTime;
            newItem.pixel = $scope.editLineItem.pixelSelected;
            newItem.pixelId = $scope.editLineItem.pixelSelected.id;
            newItem.systemOfRecordSelected = $scope.editLineItem.systemOfRecordSelected;

            // vendorConfigId is the parameter backend accepts
            newItem.vendorConfigId = $scope.editLineItem.systemOfRecordSelected.id;

            // handle real edit mode
            newItem.campaignId = (campaignId === '-999') ? '-999' : campaignId;

            // this is in case of edit mode where line item has id
            if (lineItemObj) {
                newItem.id = lineItemObj.id;
                newItem.updatedAt = lineItemObj.updatedAt;
                newItem.hasInFlightAds = lineItemObj.hasInFlightAds;
            }

            return newItem;
        }

        function setCogsValue() {
            var index;

            selectedAdvertiser = workflowService.getAdvertiserTypeValue();

            if (selectedAdvertiser && (selectedAdvertiser.billingValue && selectedAdvertiser.billingTypeId)) {
                index =
                    _.findIndex($scope.type, function (item) {
                    return item.id ===  selectedAdvertiser.billingTypeId;
                });

                if (index !== -1) {
                    $scope.setLineItem($scope.type[index], 'create');
                }
            }
        }

        // shows error message if line item billable amount exceed media plan budget
        // return true if the line item budget exceeds media plan budget
        function doesLineItemExceedBudget(billableAmount,totalBudget) {
            totalBudget = totalBudget || 0;
            if (Number(billableAmount) > totalBudget) {
                $rootScope.setErrAlertMessage('Line Item budget cannot exceed media plan budget');
                return true;
            }

            return false;
        }

        function associatePixels () {
            var pixelObjIndex,
                selectedIndex,
                i,

                findPixel = function (obj) {
                    return obj.id === $scope.lineItems.lineItemList[i].pixelId;
                },

                findPixel2 = function (item) {
                    return item.id===$scope.selectedCampaign.pixelList[pixelObjIndex];
                };

            for (i = 0; i < $scope.lineItems.lineItemList.length; i++) {
                pixelObjIndex = _.findIndex($scope.selectedCampaign.pixelList, findPixel);

                if (pixelObjIndex !== -1) {
                    selectedIndex = _.findIndex( $scope.selectedCampaign.selectedPixel, findPixel2);

                    if (selectedIndex === -1) {
                        $scope.$parent.selectPixel($scope.selectedCampaign.pixelList[pixelObjIndex]);
                    }
                }
            }
        }

        // populate line item in case of edit and cancel of edit
        function populateLineItemEdit(event, lineItem) {
            var target = $(event.target),
                index,
                lineItemStartDateElem,
                lineItemEndDateElem;

            index = target.parents('.tr').find('.tableEdit').attr('data-table-index');
            lineItemStartDateElem = $('#editLineItemStartDate' + index);
            lineItemEndDateElem = $('#editLineItemEndDate' + index);

            $scope.editLineItem.lineItemName = lineItem.name;
            $scope.editLineItem.lineItemType = lineItem.lineItemType;
            $scope.editLineItem.pixelSelected = lineItem.pixel;
            $scope.editLineItem.systemOfRecordSelected = lineItem.systemOfRecordSelected;
            $scope.editLineItem.pricingRate = lineItem.pricingRate;
            $scope.editLineItem.billableAmount = lineItem.billableAmount;
            $scope.editLineItem.volume = lineItem.volume;
            $scope.editLineItem.selectedVolumeType = lineItem.volumeType;
            $scope.editLineItem.hasInFlightAds = lineItem.hasInFlightAds;
            if($scope.cloneMediaPlanName) {
                $scope.editLineItem.hasInFlightAds = false;
            }

            // if pixel is empty show select from list in edit section for create/edit mode
            if (_.isEmpty($scope.editLineItem.pixelSelected)) {
                $scope.editLineItem.pixelSelected = {};
                $scope.editLineItem.pixelSelected.name = 'Select...';
                $scope.editLineItem.pixelSelected.id = '';
            }

            // set line Item End Date
            if (lineItem.endTime) {
                $scope.editLineItem.endTime = lineItem.endTime;
            }

            // set line Item start Date
            if (lineItem.startTime) {
                $scope.editLineItem.startTime = lineItem.startTime;
                lineItemStartDateElem.datepicker('setStartDate', $scope.selectedCampaign.startTime);
                lineItemStartDateElem.datepicker('update', lineItem.startTime);
            }

            if (lineItem.adGroupName) {
                $scope.editLineItem.adGroupName = lineItem.adGroupName;
            }

            lineItemStartDateElem.datepicker('setEndDate', $scope.selectedCampaign.endTime);
            lineItemEndDateElem.datepicker('setEndDate', $scope.selectedCampaign.endTime);

            $scope.setLineItem($scope.editLineItem.lineItemType, 'edit');
            $scope.setPixels($scope.editLineItem.pixelSelected, 'edit');
        }

        $scope.CONST_COGS_PERCENT = 'COGS+ %';
        $scope.CONST_FLAT_FEE = 'Flat Fee';
        $scope.volumeType = ['Impressions','Clicks','Actions'];
        $scope.pixelSelected = {};
        $scope.pixelSelected.name = 'Select...';
        $scope.systemOfRecordSelected = {};
        $scope.systemOfRecordSelected.name = 'Select Vendor...';
        $scope.selectedVolumeType = '';
        $scope.editLineItem.selectedVolumeType = '';
        $scope.selectedCampaign.lineItemBillableAmountTotal = 0;
        $scope.selectedCampaign.createItemList = false;
        $scope.showUploadRecordsMessageLineItems = false;

        // TODO: (to Shrujan) What are these 2 lines' initialization supposed to be?
        $scope.selectedCampaign.lineItemfile = '';
        $scope.selectedCampaign.rejectedFiles = '';

        // edit mode - save media plan along with line item
        $scope.showConfirmPopupCreate = false;
        $scope.showConfirmPopupEdit = false;
        $scope.showConfirmPopupBulkUpload = false;
        $scope.correctLineItems = [];
        $scope.successfulLineItemCount = 0;
        $scope.errorLineItemCount = 0;

        /*---START------BULK LineItem Upload Section---------*/
        /*function to download empty template*/
        $scope.downloadTemplate = function () {
            var url = vistoconfig.apiPaths.WORKFLOW_API_URL +'/lineitems/downloadTemplate';

            $('.download-report-load-icon').show();

            dataService
                .downloadFile(url)
                .then(function (response) {
                    if (response.status === 'success') {
                        $('.download-report-load-icon').hide();
                        saveAs(response.file, response.fileName);
                    } else {
                        $('.download-report-load-icon').hide();
                    }
                });
        };

        /*show bulkupload section on click of export lineItem*/
        $scope.showBulkUploadsection=function () {
            $('.upload_files_selected_container').slideDown();
            $('.common_file_upload_container').slideDown();
        };

        /* once file is selected, hide the dragover box*/
        $scope.fileSelected=function (file,action) {
            if ($scope.selectedCampaign.lineItemfile && action === 'edit') {
                $('.common_file_upload_container').hide();
            }
        };

        /* Function to upload the csv file selected, Based on response, show popUp with number of
         * success-failure-errorLog download link
         * call getLineItems() to get the saved and newly uploaded line items
         */
        $scope.$parent.uploadFileChosenLineItem = function (uploadMode) {
            var budget,
                clientId,
                url;

            // if we have to save the media plan prior to line item
            $scope.showConfirmPopupBulkUpload = false;

            if ($scope.saveMediaPlan) {
                // this is temp save in case we need to save media plan before line item
                workflowService.setLineItemBulkData($scope.selectedCampaign.lineItemfile);

                // show popup
                $scope.showConfirmPopupBulkUpload = true;
            } else if (uploadMode === 'create') {
                if ($scope.selectedCampaign.lineItemfile) {
                    // bulk upload loader flag
                    $scope.bulkUploadItemLoaderEdit = true;
                    budget = $scope.Campaign.totalBudget ? $scope.Campaign.totalBudget : 0;

                    clientId = ($scope.selectedCampaign.clientId) ?
                        $scope.selectedCampaign.clientId :
                        loginModel.getSelectedClient().id;

                    url= vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertiser/' + $scope.selectedCampaign.advertiserId +
                        '/lineitems/parseCSV?campaignEndDate=' + $scope.selectedCampaign.endTime +
                        '&campaignStartDate=' + $scope.selectedCampaign.startTime + '&campaignTotalBudget=' + budget;

                    (function () {
                        Upload
                            .upload({
                                url: url,
                                fileFormDataName: 'lineitemList',
                                file: $scope.selectedCampaign.lineItemfile
                            })
                            .then(function (response) {
                                var correctLineItem,
                                    i;

                                resetSuccessErrorCount();

                                $scope.bulkUploadItemLoaderEdit = false;
                                $scope.$parent.successfulRecords = response.data.data.success;
                                $scope.verifiedItems=response.data.data.success;
                                $scope.$parent.errorRecords = response.data.data.failure;
                                $scope.$parent.errorRecordsFileName = response.data.data.logFileDownloadLink;
                                $scope.successfulLineItemCount=$scope.$parent.successfulRecords.length;
                                $scope.errorLineItemCount=$scope.$parent.errorRecords.length;

                                if ($scope.$parent.errorRecords.length > 0) {
                                    $scope.$parent.bulkUploadResultHeader += ' - Errors found';
                                }

                                $scope.showUploadRecordsMessageLineItems = true;
                                $scope.correctLineItems.length=0;
                                correctLineItem = {};

                                for (i = 0; i < $scope.verifiedItems.length; i++) {
                                    correctLineItem = $scope.verifiedItems[i].lineitem;
                                    correctLineItem.adGroupName = $scope.verifiedItems[i].adGroupName;
                                    $scope.correctLineItems.push(correctLineItem);
                                }

                                // Function insert verified line items to newItem and push to lineItems.
                                // lineItemList array to display on UI
                                lineItemCreateBulkUpload();
                                associatePixels();

                                $scope.clearFileSelected();
                            }, function () {
                                $scope.uploadBusy = false;
                                $scope.uploadErrorMsg = 'Unable to upload the file.';

                                // bulk upload loader
                                $scope.bulkUploadItemLoaderEdit = false;
                            });
                    })($scope.selectedCampaign.lineItemfile);
                }
            } else if (uploadMode === 'edit') {
                if ($scope.selectedCampaign.lineItemfile) {
                    // bulk upload loader flag
                    $scope.bulkUploadItemLoaderEdit = true;

                    clientId = ($scope.selectedCampaign.clientId) ?
                        $scope.selectedCampaign.clientId :
                        loginModel.getSelectedClient().id;

                    url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/campaigns/' + $routeParams.campaignId +
                        '/lineitems/bulkUpload';

                    (function () {
                        Upload
                            .upload({
                                url: url,
                                fileFormDataName: 'lineitemList',
                                file: $scope.selectedCampaign.lineItemfile
                            })
                            .then(function (response) {
                                resetSuccessErrorCount();

                                $scope.$parent.successfulRecords = response.data.data.success;
                                $scope.$parent.errorRecords = response.data.data.failure;
                                $scope.$parent.errorRecordsFileName = response.data.data.logFileDownloadLink;
                                $scope.successfulLineItemCount=$scope.$parent.successfulRecords.length;
                                $scope.errorLineItemCount=$scope.$parent.errorRecords.length;

                                if ($scope.$parent.errorRecords.length > 0) {
                                    $scope.$parent.bulkUploadResultHeader += ' - Errors found';
                                }

                                $scope.showUploadRecordsMessageLineItems = true;

                                // make lineitems call n refresh that data
                                workflowService
                                    .getLineItem(clientId, $routeParams.campaignId, true)
                                    .then(function (results) {
                                        if (results.status === 'success' && results.data.statusCode === 200) {
                                            $scope.lineItems.lineItemList = [];
                                            $scope.processLineItemEditMode(results.data.data);
                                            associatePixels();
                                        }
                                    });

                                $scope.clearFileSelected();

                                // bulk upload loader
                                $scope.bulkUploadItemLoaderEdit = false;
                            }, function () {
                                $scope.uploadBusy = false;
                                $scope.uploadErrorMsg = 'Unable to upload the file.';

                                // bulk upload loader
                                $scope.bulkUploadItemLoaderEdit = false;
                            });
                    })($scope.selectedCampaign.lineItemfile);
                }
            }
        };

        $scope.cancelMediaPlanUpload = function () {
            $scope.showConfirmPopupBulkUpload = false;
            $scope.bulkUploadItemLoaderEdit = false;
        };

        // Function to download error log, when some rows in upload fails to upload
        $scope.downloadErrorLog = function (url) {
            var downloadErrorurl = vistoconfig.apiPaths.WORKFLOW_API_URL + '' + url.slice(16, url.length);

            $('.download-report-load-icon').show();

            dataService
                .downloadFile(downloadErrorurl)
                .then(function (response) {
                    if (response.status === 'success') {
                        $('.download-report-load-icon').hide();
                        saveAs(response.file, response.fileName);
                    } else {
                        $('.download-report-load-icon').hide();
                    }
                });
        };

        // function to close the Success/Error popUp after uploading the csv file
        $scope.hideuploadFileChosenLineItem = function () {
            $scope.showUploadRecordsMessageLineItems = false ;
        };

        // Reset lineItem bulkUpload part in the UI
        $scope.clearFileSelected = function () {
            $('.upload_files_selected_container').slideUp();
            $('.common_file_upload_container').slideUp().hide();
            $scope.selectedCampaign.lineItemfile = undefined;
        };

        // Reset the error notification for wrong file or large file
        $scope.closeErrorMessage = function () {
            $scope.uploadErrorMsg = undefined;
            $scope.selectedCampaign.rejectedFiles=undefined;
        };

        /*---END------BULK LineItem Upload Section---------*/
        $scope.showNewLineItemForm = function () {
            $scope.selectedCampaign.createItemList = true;
            $scope.lineItemErrorFlag = false;

            // update type arr and selected advertiser
            setCogsValue();

            $scope.initiateLineItemDatePicker();
        };

        $scope.$parent.createNewLineItem = function (mode, lineItemObj) {
            var newItem = {};
            $scope.Campaign.showBudgetZeroPopup = false;
            if (mode === 'create' ) {
                if ($scope.lineItemName !== '') {
                    newItem = createLineItemObj(lineItemObj);

                    if (doesLineItemExceedBudget(newItem.billableAmount,$scope.Campaign.totalBudget)) {
                        return false;
                    }

                    $scope.lineItems.lineItemList.push(newItem);
                    $scope.selectedCampaign.resetLineItemParameters();
                    validateMediaPlanDates();
                }
            } else {
                newItem = createEditLineItemObj(oldLineItem);
                $scope.lineItems.lineItemList.push(newItem);
                validateMediaPlanDates();
            }

            $scope.calculateLineItemTotal();
        };

        $scope.$parent.createNewLineItemInEditMode = function () {
            var newItem;

            $scope.Campaign.showBudgetZeroPopup = false;

            // this is kept to initially create object in case we have to save it in service -
            // line item edit mode - save media plan q
            newItem = createLineItemObj();

            // calc budget for validation against campaign budget
            if (doesLineItemExceedBudget(newItem.billableAmount,$scope.Campaign.totalBudget)) {
                return false;
            }

            // if we have to save the media plan prior to line item
            $scope.showConfirmPopupCreate = false;
            if ($scope.saveMediaPlan) {
                // this is temp save in case we need to save media plan before line item
                workflowService.setLineItemData(newItem);

                // show popup
                $scope.showConfirmPopupCreate = true;

                //in case the budget or rate is 0. A overlay popup shows up, this will hide it
                $scope.Campaign.showBudgetZeroPopup = false;
            } else {
                // this is temp save in case we need to save media plan before line item
                newItem = workflowService.getLineItemData();

                if (!newItem) {
                    newItem = createLineItemObj();
                }

                // loader for save button
                $scope.Campaign.createNewLineItemLoaderEdit = true;

                newItem.startTime = momentService.localTimeToUTC(newItem.startTime, 'startTime');
                newItem.endTime = momentService.localTimeToUTC(newItem.endTime, 'endTime');

                // in case pricerate is 30% markup remove the Markup
                if (typeof newItem.pricingRate === 'string') {
                    newItem.pricingRate = Number(newItem.pricingRate.split('%')[0]);
                }

                // else just save line item
                workflowService
                    .createLineItems($scope.selectedCampaign.clientId, $scope.selectedCampaign.campaignId, newItem)
                    .then(function (results) {
                        var campaignObj;

                        if (results.status === 'success' && results.data.statusCode === 201) {
                            campaignObj = $scope.createCampaignAccess();
                            campaignObj.fetchLineItemDetails(vistoconfig.getSelectedAccountId(),$scope.selectedCampaign.campaignId);
                            $scope.selectedCampaign.resetLineItemParameters();
                            newItem = createLineItemObj();
                            workflowService.setLineItemData(null);
                        } else {
                            $rootScope.setErrAlertMessage(results.data.data.message );
                            workflowService.setLineItemData(null);

                            // hide loader
                            $scope.createNewLineItemLoader = false;
                            $scope.Campaign.createNewLineItemLoaderEdit = false;
                        }

                        // hide loader
                        $scope.createNewLineItemLoader = false;
                        $scope.Campaign.createNewLineItemLoaderEdit = false;
                    });
            }
        };

        $scope.cancelMediaPlanCreation = function () {
            $scope.showConfirmPopupCreate = false;
            $scope.Campaign.createNewLineItemLoaderEdit = false;
        };



        $scope.$parent.updateLineItemInEditMode = function () {

            var newItem = workflowService.getLineItemDataEdit();

            // this hack is to make it work in edit mode when media plan save is requierd prior to line item
            // check if we have saved line item details in service or create a new line item object

            if (!newItem) {
                newItem = createEditLineItemObj(angular.copy(oldLineItem));
            }

            if (doesLineItemExceedBudget(newItem.billableAmount,$scope.Campaign.totalBudget)) {
                return false;
            }

            // if we have to save the media plan prior to line item
            $scope.showConfirmPopupEdit = false;
            if ($scope.saveMediaPlan) {
                // this is temp save in case we need to save media plan before line item
                workflowService.setLineItemDataEdit(newItem);

                // show popup
                $scope.showConfirmPopupEdit = true;

                //in case the budget or rate is 0. A overlay popup shows up, this will hide it
                $scope.Campaign.showBudgetZeroPopup = false;
            } else {
                // this is temp save in case we need to save media plan before line item
                newItem = workflowService.getLineItemDataEdit();

                // loader for update buton
                $scope.editLineItemLoaderEdit = true;

                if (!newItem) {
                    newItem = createEditLineItemObj(angular.copy(oldLineItem));
                }

                newItem.startTime = momentService.postDateModifier(newItem.startTime, lineItemAPIStartTimeList[oldLineItemIndex], 'startTime');
                newItem.endTime = momentService.postDateModifier(newItem.endTime, lineItemAPIEndTimeList[oldLineItemIndex], 'endTime');

                // in case pricerate is 30% markup remove the Markup
                if (typeof newItem.pricingRate === 'string') {
                    newItem.pricingRate = Number(newItem.pricingRate.split('%')[0]);
                }

                // update line item
                workflowService
                    .updateLineItems($scope.selectedCampaign.clientId, $scope.selectedCampaign.campaignId, newItem)
                    .then(function (results) {
                        var campaignObj;

                        if (results.status === 'success' &&
                            (results.data.statusCode === 200 || results.data.statusCode === 201)) {
                            campaignObj = $scope.createCampaignAccess();
                            campaignObj.fetchLineItemDetails(vistoconfig.getSelectedAccountId(), $scope.selectedCampaign.campaignId);
                            $scope.calculateLineItemTotal();
                            workflowService.setLineItemDataEdit(null);
                        } else {
                            $rootScope.setErrAlertMessage(results.data.data.message);
                        }

                        $scope.editLineItemLoader = false;
                        $scope.editLineItemLoaderEdit = false;
                    });
            }
        };

        $scope.cancelMediaPlanCreationEdit = function () {
            $scope.showConfirmPopupEdit = false;
            $scope.editLineItemLoaderEdit = false;

        };

        $scope.setLineItem = function (obj, mode) {
            if (mode !== 'edit') {
                $scope.lineItemType = obj;
            } else {
                $scope.editLineItem.lineItemType = obj;
            }

            if (mode === 'create') {
                $scope.lineRate = '';
                $scope.rateReadOnly = false;
                $scope.volumeFlag = true;
                $scope.volumeTypeFlag = false;
                $scope.amountFlag = true;
                $scope.rateTypeReadOnly = false;
                $scope.hideLineItemRate = false;
                $scope.pricingRate = '';
                $scope.hideAdGroupName = false;
                $scope.showPixelsList = false;
                $scope.showSystemOfRecord = true;

                if (CONST_COGS_PERCENT === $scope.lineItemType.name) {
                    if (selectedAdvertiser && (selectedAdvertiser.billingTypeId && selectedAdvertiser.billingValue)) {
                        $scope.rateReadOnly = true;

                        // to get via advertiser api
                        $scope.pricingRate = selectedAdvertiser.billingValue + '% Markup';

                        $('.lineItemType')
                            .html('<span class="text" data-ng-bind="lineItemType.name">' +
                                $scope.lineItemType.name +
                                '</span> <span class="icon-arrow-solid-down"></span>'
                            );
                    }

                    $scope.volumeFlag = true;
                    $scope.volume = '';
                    $scope.volumeTypeFlag = true;
                    $scope.selectedVolumeType = '';
                } else if (CONST_COGS_CPM === $scope.lineItemType.name) {
                    if (selectedAdvertiser && (selectedAdvertiser.billingTypeId && selectedAdvertiser.billingValue)) {
                        $scope.rateReadOnly = true;

                        // to get via advertiser api
                        $scope.pricingRate = selectedAdvertiser.billingValue;
                    }

                    $scope.volumeFlag = false;
                    $scope.volume = '';
                    $scope.volumeTypeFlag = false;
                    $scope.selectedVolumeType = '';
                } else if (CONST_FLAT_FEE === $scope.lineItemType.name) {
                    if (selectedAdvertiser && (selectedAdvertiser.billingTypeId && selectedAdvertiser.billingValue)) {
                        $scope.rateReadOnly = true;

                        // to get via advertiser api
                        $scope.pricingRate = selectedAdvertiser.billingValue;
                    }

                    $scope.hideAdGroupName = true;
                    $scope.hideLineItemRate = true;
                    $scope.pricingRate = '0';

                    $scope.volumeFlag = false;
                    $scope.volume = '';
                    $scope.volumeTypeFlag = false;
                    $scope.selectedVolumeType = '';

                    $scope.billableAmount = '';
                    $scope.systemOfRecordSelected = {};
                    $scope.systemOfRecordSelected.name = 'Select Vendor...';

                    $('.systemOfRecordName')
                        .html('<span class="text" data-ng-bind="systemOfRecordSelected.name">' +
                            'Select Vendor...</span><span class="icon-arrow-solid-down"></span>');

                    $scope.showSystemOfRecord = false;
                } else if (CONST_POST_IMPRESSION_CPA === $scope.lineItemType.name ||
                    CONST_TOTAL_CPA === $scope.lineItemType.name ||
                    CONST_POST_CLICK_CPA === $scope.lineItemType.name) {
                    $scope.showPixelsList = true;
                    $scope.volumeTypeFlag = false;
                    $scope.selectedVolumeType = '';
                }
            } else {
                $scope.rateReadOnlyEdit = false;
                $scope.billableAmount = '';
                $scope.volumeFlagEdit = true;
                $scope.volumeTypeFlagEdit = false;
                $scope.amountFlagEdit = true;
                $scope.hideLineItemRateEdit = false;
                $scope.hideAdGroupNameEdit = false;
                $scope.showPixelsListEdit = false;
                $scope.showSystemOfRecordEdit = true;

                // this is to set line ad group name to line item name in case adGroup is empty
                // this is to not blindly set ad group name to line item name in create mode
                if ($scope.editLineItem.adGroupName === '') {
                    $scope.editLineItem.adGroupName =  $scope.editLineItem.lineItemName;
                }

                if (CONST_COGS_PERCENT === $scope.editLineItem.lineItemType.name) {
                    if (selectedAdvertiser && (selectedAdvertiser.billingTypeId && selectedAdvertiser.billingValue)) {
                        $scope.rateReadOnlyEdit = true;

                        // to get via advertiser api
                        $scope.editLineItem.pricingRate = selectedAdvertiser.billingValue+ '% Markup';
                        $scope.rateTypeReadOnlyEdit = true;
                    }

                    $scope.volumeFlagEdit = true;
                    // $scope.editLineItem.volume = '';
                    $scope.volumeTypeFlagEdit = true;
                    $scope.editLineItem.pixelSelected = {};
                } else if (CONST_COGS_CPM === $scope.editLineItem.lineItemType.name) {
                    if (selectedAdvertiser && (selectedAdvertiser.billingTypeId && selectedAdvertiser.billingValue)) {
                        $scope.rateReadOnlyEdit = true;

                        // to get via advertiser api
                        $scope.editLineItem.pricingRate = selectedAdvertiser.billingValue;

                        $scope.rateTypeReadOnlyEdit = true;
                    }

                    $scope.volumeFlagEdit = false;
                    $scope.editLineItem.volume = '';
                    $scope.volumeTypeFlagEdit = false;
                    $scope.editLineItem.pixelSelected = {};
                } else if (CONST_FLAT_FEE === $scope.editLineItem.lineItemType.name) {
                    if (selectedAdvertiser && (selectedAdvertiser.billingTypeId && selectedAdvertiser.billingValue)) {
                        $scope.rateReadOnlyEdit = true;

                        // to get via advertiser api
                        $scope.editLineItem.pricingRate = selectedAdvertiser.billingValue;
                        $scope.rateTypeReadOnlyEdit = true;
                    }

                    $scope.hideLineItemRateEdit = true;
                    $scope.editLineItem.pricingRate = '0';

                    $scope.volumeFlagEdit = false;
                    $scope.editLineItem.volume = '';
                    $scope.volumeTypeFlagEdit = false;

                    // ad group in edit mode
                    $scope.hideAdGroupNameEdit = true;
                    $scope.editLineItem.adGroupName = '';
                    $scope.editLineItem.pixelSelected = {};
                    $scope.editLineItem.systemOfRecordSelected = {};
                    $scope.editLineItem.systemOfRecordSelected.name = 'Select Vendor...';
                    $scope.showSystemOfRecordEdit = false;
                } else if (CONST_POST_IMPRESSION_CPA === $scope.editLineItem.lineItemType.name ||
                    CONST_TOTAL_CPA === $scope.editLineItem.lineItemType.name ||
                    CONST_POST_CLICK_CPA === $scope.editLineItem.lineItemType.name) {
                    $scope.showPixelsListEdit = true;

                    if (_.isEmpty($scope.editLineItem.pixelSelected)) {
                        $scope.editLineItem.pixelSelected = {};
                        $scope.editLineItem.pixelSelected.name = 'Select...';
                        $scope.editLineItem.pixelSelected.id = '';
                    }
                }
            }

            // trigger volume calculation
            $scope.calculateVolume(mode);
        };

        $scope.selectedCampaign.resetLineItemParameters = function () {
            $scope.lineItemName = '';
            $scope.lineItemType = {};
            $scope.lineItemType.name = 'Select...';
            $scope.lineItemType.id = '';
            $scope.pixelSelected = {};
            $scope.systemOfRecordSelected = {};

            $('.lineItemType')
                .html(
                    '<span class="text" data-ng-bind="lineItemType.name">Select...</span>' +
                    '<span class="icon-arrow-solid-down"></span>'
                );

            $('.pixelType')
                .html(
                    '<span class="text" data-ng-bind="pixelSelected.name">Select...</span>' +
                    '<span class="icon-arrow-solid-down"></span>'
                );

            $('.systemOfRecordName')
                .html(
                    '<span class="text" data-ng-bind="systemOfRecordSelected.name">Select Vendor...</span>' +
                    '<span class="icon-arrow-solid-down"></span>'
                );

            $('.selectVolumeType')
                .html(
                    '<span class="text" data-ng-bind="selectedVolumeType">Select...</span>' +
                    '<span class="icon-arrow-solid-down"></span>'
                );



            $scope.volume = '';
            $scope.billableAmount = '';
            $scope.pricingRate = '';
            $scope.adGroupName = '';
            $scope.lineTarget = '';
            $scope.selectedCampaign.createItemList = false;

            $scope.rateReadOnly = false;
            $scope.volumeFlag = true;
            $scope.volumeTypeFlag = false;
            $scope.selectedVolumeType = '';
            $scope.amountFlag = true;
            $scope.hideAdGroupName = false;
            $scope.showPixelsList = false;
            $scope.hideLineItemRate = false;
            $scope.showSystemOfRecordEdit = true;
            $scope.showSystemOfRecord = true;
        };

        // Line Item Table Row Edit
        $scope.showEditItemRow = function (event, lineItem) {
            var target = event.currentTarget;

            oldLineItem = angular.copy(lineItem);
            oldLineItemIndex = _.findIndex($scope.lineItems.lineItemList, function (item) {
                if (item.name === oldLineItem.name &&
                    item.billingTypeId === oldLineItem.billingTypeId &&
                    item.pricingRate === oldLineItem.pricingRate) {
                    return true;
                }
            });

            $('.tr .tableNormal').show();
            $('.tr .tableEdit').hide();

            $(target).toggle();
            $(target).closest('.tr').find('.tableEdit').toggle();

            // update type arr and selected advertiser
            setCogsValue();

            // disable flat fee in case the user created media plan with line item with rate type other than FLAT FEE
            if ($scope.mode === 'edit') {
                $scope.showConfirmPopupEdit = false ;
                $scope.disableFlatFeeEdit = false;
                $scope.rateTypeReadOnlyEdit = false;

                if (lineItem.lineItemType.name !== CONST_FLAT_FEE) {
                    $scope.disableFlatFeeEdit = true;
                } else {
                    $scope.rateTypeReadOnlyEdit = true;
                }
            }

            // populate edit lineitem fields
            populateLineItemEdit(event, lineItem);
        };

        $scope.$parent.updateLineItem = function () {
            if (doesLineItemExceedBudget($scope.editLineItem.billableAmount, $scope.Campaign.totalBudget)) {
                return false;
            }

            $scope.deleteLineItem(false);
            $scope.createNewLineItem('edit');
        };

        $scope.deleteLineItem = function () {
            var index = _.findIndex($scope.lineItems.lineItemList, function (item) {
                if (item.name === oldLineItem.name &&
                    item.billingTypeId === oldLineItem.billingTypeId &&
                    item.pricingRate === oldLineItem.pricingRate) {
                    return true;
                }
            });

            if ($scope.mode === 'create' || $scope.cloneMediaPlanName) {
                $scope.lineItems.lineItemList.splice(index, 1);
            } else {
                // not used right now
                workflowService.deleteLineItem(oldLineItem, $scope.selectedCampaign.clientId);
            }

            $scope.calculateLineItemTotal();
        };

        // validate Line Item Flight Dates
        $scope.validateDateLineItem = function (startTime, endTime, endElemId) {
            var endDateElem = $('#' + endElemId),
                changeDate;

            if ($scope.mode !== 'edit') {
                if (startTime && moment(startTime).isAfter(endTime)) {
                    endDateElem.removeAttr('disabled').css({'background': 'transparent'});
                    changeDate = moment(startTime).format(constants.DATE_US_FORMAT);
                    endDateElem.datepicker('setStartDate', changeDate);
                    endDateElem.datepicker('update', changeDate);
                } else {
                    endDateElem.removeAttr('disabled').css({'background': 'transparent'});
                    endDateElem.datepicker('setStartDate', startTime);
                    endDateElem.datepicker('update', endTime);
                }

                $scope.updateLineItemCreateDate();
            } else {
                if (moment(endTime).isBefore(moment(startTime))) {
                    endDateElem.removeAttr('disabled').css({'background': 'transparent'});
                    endDateElem.datepicker('setStartDate', startTime);
                    endDateElem.datepicker('update', endTime);
                } else {
                    endDateElem.removeAttr('disabled').css({'background': 'transparent'});
                    endDateElem.datepicker('setStartDate', startTime);
                    endDateElem.datepicker('update', endTime);
                }
            }
            if (moment(startTime).isAfter(endTime, 'day')) {
                endDateElem.datepicker('update', startTime);
            }
        };

        // ******** Line item edit mode ******
        $scope.$parent.processLineItemEditMode = function (lineItemList) {
            $scope.lineItems.lineItemList.length = 0;

            _.each(lineItemList, function (item, idx) {
                var index = _.findIndex($scope.type, function (type) {
                        return type.id === item.billingTypeId;
                    }),

                    pixelIndex,
                    sorIndex;

                $scope.lineItemName = item.name;

                if (index !== -1) {
                    $scope.setLineItem($scope.type[index], 'create');
                }

                // pixel
                if (item.pixelId) {
                    pixelIndex = _.findIndex($scope.selectedCampaign.pixelList, function (type) {
                        return type.id === item.pixelId;
                    });

                    if (pixelIndex !== -1) {
                        $scope.pixelSelected = $scope.selectedCampaign.pixelList[pixelIndex];
                        $scope.pixelSelected.id = item.pixelId;
                    }
                }

                // SOR
                if (item.vendorConfigId) {
                    sorIndex =
                            _.findIndex($scope.selectedCampaign.systemOfRecord, function (type) {
                            return type.id === item.vendorConfigId;
                        });

                    if (sorIndex !== -1) {
                        $scope.systemOfRecordSelected = $scope.selectedCampaign.systemOfRecord[sorIndex];
                        $scope.systemOfRecordSelected.id = item.vendorConfigId;
                    }
                }

                $scope.hideAdGroupNameEdit = true;
                $scope.lineItemType.id = item.billingTypeId;
                $scope.billableAmount = item.billableAmount;
                $scope.volume = item.volume;
                if(item.volumeType) {
                    $scope.selectedVolumeType = item.volumeType;
                }
                $scope.pricingRate = item.billingRate;

                // line start Date
                lineItemAPIStartTimeList[idx] = item.startTime;
                $scope.lineItemStartDate = momentService.utcToLocalTime(item.startTime);

                // line Item End Date
                lineItemAPIEndTimeList[idx] = item.endTime;
                $scope.lineItemEndDate = momentService.utcToLocalTime(item.endTime);

                if ( $scope.campaignDate ) {
                    $scope.lineItemdiffDays =
                        momentService.dateDiffInDays($scope.lineItemStartDate,$scope.lineItemEndDate);
                }

                if ( $scope.campaignDate && $scope.flightDateChosen === 'automaticFlightDates' ) {
                    if ( !$scope.ifClonedDateLessThanStartDate ) {
                        $scope.lineItemStartDate =
                            momentService.addDaysCustom($scope.lineItemStartDate, 'MM/DD/YYYY', $scope.newdiffDays);
                        $scope.lineItemEndDate =
                            momentService.addDaysCustom($scope.lineItemEndDate, 'MM/DD/YYYY', $scope.newdiffDays);
                    } else {
                        $scope.lineItemStartDate =
                            momentService.substractDaysCustom($scope.lineItemStartDate, 'MM/DD/YYYY',
                                $scope.lessdiffDays);
                        $scope.lineItemEndDate =
                            momentService.addDaysCustom($scope.lineItemStartDate , 'MM/DD/YYYY',
                                $scope.lineItemdiffDays);
                    }
                }

                $scope.createNewLineItem('create', item);
            });
        };

        // line item date picker
        $scope.initiateLineItemDatePicker = function () {
            var startDateElem = $('#lineItemStartDateInput'),
                endDateElem = $('#lineItemEndDateInput');

            $scope.campaignStartDate = $scope.lineItemStartDate = $scope.selectedCampaign.startTime;
            $scope.campaignEndDate = $scope.lineItemEndDate = $scope.selectedCampaign.endTime;

            // line Item start Date
            startDateElem.datepicker('setStartDate', $scope.campaignStartDate);
            startDateElem.datepicker('update', $scope.campaignStartDate);
            startDateElem.datepicker('setEndDate', $scope.campaignEndDate);

            // line Item End Date
            endDateElem.datepicker('setStartDate', $scope.campaignStartDate);
            endDateElem.datepicker('update', $scope.campaignEndDate);
            endDateElem.datepicker('setEndDate', $scope.campaignEndDate);
        };

        $scope.setPixels = function (pixel, mode) {
            if (mode === 'create') {
                $scope.pixelSelected = pixel;
            } else {
                $scope.editLineItem.pixelSelected = pixel;
            }
        };

        $scope.setSystemOfRecord = function (sor, mode) {
            if (mode === 'create') {
                $scope.systemOfRecordSelected = sor;
            } else {
                $scope.editLineItem.systemOfRecordSelected = sor;
            }
        };

        $scope.setVolumeType = function (volumeType, mode) {
            if (mode === 'create') {
                $scope.selectedVolumeType = volumeType;
            } else {
                $scope.editLineItem.selectedVolumeType = volumeType;
            }
        };

        $scope.hideLineItemEditRow = function (event) {
            var target = event.currentTarget;

            $scope.lineItems.lineItemList[oldLineItemIndex] = oldLineItem;
            $(target).closest('.tr').find('.tableNormal').toggle();
            $(target).closest('.tr').find('.tableEdit').toggle();
        };

        $scope.$parent.filterLineItemBasedOnPixel = function (id) {
            var tempList = _.extend($scope.lineItems.lineItemList),
                i;

            for (i = 0; i < tempList.length; i++) {
                if (tempList[i].pixelId && tempList[i].pixelId === id) {
                    tempList.splice(i, 1);
                }
            }

            $scope.lineItems.lineItemList = tempList;
        };

        $scope.calculateLineItemTotal = function () {
            $scope.selectedCampaign.lineItemBillableAmountTotal = 0;

            _.each($scope.lineItems.lineItemList,function (item) {
                $scope.selectedCampaign.lineItemBillableAmountTotal += Number(item.billableAmount);
            });
        };

        $scope.calculateVolume = function (mode) {
            if (mode === 'create') {
                if (CONST_COGS_PERCENT !== $scope.lineItemType.name &&
                    CONST_FLAT_FEE !== $scope.lineItemType.name &&
                    CONST_COGS_CPM !== $scope.lineItemType.name) {
                            $scope.volume = '';
                            if ($scope.lineItemType &&
                                $scope.lineItemType.name &&
                                $scope.pricingRate &&
                                $scope.billableAmount &&
                                $scope.pricingRate > 0) {
                                if ($scope.lineItemType.name === 'CPM') {
                                    $scope.volume = ($scope.billableAmount / $scope.pricingRate ) * 1000;
                                } else {
                                    $scope.volume = ($scope.billableAmount / $scope.pricingRate );
                                }

                                $scope.volume = Math.round($scope.volume);
                            } else {
                                $scope.volume = 0;
                            }
                }
            } else {
                if (CONST_COGS_PERCENT !== $scope.editLineItem.lineItemType.name &&
                    CONST_FLAT_FEE !== $scope.editLineItem.lineItemType.name &&
                    CONST_COGS_CPM !== $scope.editLineItem.lineItemType.name) {
                    $scope.editLineItem.volume = '';

                    if ($scope.editLineItem.lineItemType &&
                        $scope.editLineItem.lineItemType.name &&
                        $scope.editLineItem.pricingRate &&
                        $scope.editLineItem.billableAmount &&
                        $scope.editLineItem.pricingRate > 0) {
                        if ($scope.editLineItem.lineItemType.name === 'CPM') {
                            $scope.editLineItem.volume =
                                ($scope.editLineItem.billableAmount / $scope.editLineItem.pricingRate ) * 1000;
                        } else {
                            $scope.editLineItem.volume =
                                ($scope.editLineItem.billableAmount / $scope.editLineItem.pricingRate );
                        }

                        $scope.editLineItem.volume = Math.round($scope.editLineItem.volume);
                    } else {
                        // in case $scope.editLineItem.pricingRate is 0
                        $scope.editLineItem.volume = 0;
                    }
                }
            }
        };

        // TODO : need to make the change to optimise this code
        $scope.updateLineItemCreateDate = function () {
            $scope.lineItemStartDate = $('#lineItemStartDateInput').val();
            $scope.lineItemEndDate = $('#lineItemEndDateInput').val();
        };

        // line item navigate
        $scope.displayZeroLineItemBudgetPopUp = function(section) {
            $scope.Campaign.showBudgetZeroPopup = true;
            if(section === 'create'){
                $scope.Campaign.section = 'create';
            } else {
                $scope.Campaign.section = 'edit';
            }
        };

        $scope.navigateLineItem = function(section) {
            var zeroBudgetOrRateFlag = false; // flag to show zero popup - set flag when budget or rate is 0

            if(section === 'create') {
                if(Number($scope.billableAmount) === 0) {
                    zeroBudgetOrRateFlag = true;
                }
                else if(Number($scope.pricingRate) === 0 && $scope.lineItemType.name !== 'Flat Fee' ){
                    zeroBudgetOrRateFlag = true;
                }

                if(zeroBudgetOrRateFlag){
                    $scope.displayZeroLineItemBudgetPopUp(section);
                } else {
                    if($scope.saveMediaPlan && $scope.showConfirmPopupCreate === true){
                        $scope.saveCampaign('create', true);
                    } else if($scope.mode === 'create' || $scope.cloneMediaPlanName) {
                        $scope.createNewLineItem('create');
                    } else {
                        $scope.createNewLineItemInEditMode('create');
                    }
                }
            } else {

                if(Number($scope.editLineItem.billableAmount) === 0){
                    zeroBudgetOrRateFlag = true;
                }
                else if(Number($scope.editLineItem.pricingRate) === 0 && $scope.editLineItem.lineItemType.name !== 'Flat Fee' ){
                    zeroBudgetOrRateFlag = true;
                }

                if(zeroBudgetOrRateFlag){

                    $scope.displayZeroLineItemBudgetPopUp(section);
                } else {
                    if($scope.mode === 'create' || $scope.cloneMediaPlanName) {
                        $scope.updateLineItem();
                    } else {
                        $scope.updateLineItemInEditMode();
                    }
                }

            }
        };
    }]);
});
