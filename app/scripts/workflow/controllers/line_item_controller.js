/**
 * Created by shrujan on 02/05/16.
 */
define(['angularAMD', 'common/services/constants_service','common/services/vistoconfig_service', 'workflow/services/workflow_service','workflow/services/file_reader', 'login/login_model', 'common/moment_utils', 'workflow/directives/ng_upload_hidden'], function (angularAMD) {
    angularAMD.controller('LineItemController', function ($scope, $rootScope, $routeParams, $locale, vistoconfig, $location, $timeout, constants, workflowService, loginModel, momentService, fileReader, Upload,dataService) {
        var selectedAdvertiser,
            campaignId = '-999',
            CONST_FLAT_FEE = 'Flat Fee',
            CONST_COGS_PERCENT = 'COGS+ %',
            CONST_COGS_CPM = 'COGS + CPM Markup',
            CONST_POST_IMPRESSION_CPA = 'Post-Impression CPA',
            CONST_TOTAL_CPA = 'Total CPA',
            CONST_POST_CLICK_CPA = 'Post-Click CPA',
            oldLineItem,
            oldLineItemIndex;
        $scope.CONST_COGS_PERCENT = 'COGS+ %';
        $scope.CONST_FLAT_FEE = 'Flat Fee';
        $scope.pixelSelected = {};
        $scope.pixelSelected.name = 'Select from list';
        $scope.systemOfRecordSelected = {};
        $scope.systemOfRecordSelected.name = 'Select from list';
        $scope.selectedCampaign.lineItemBillableAmountTotal = 0;
        $scope.selectedCampaign.createItemList = false;
        $scope.showUploadRecordsMessageLineItems = false;
        $scope.selectedCampaign.lineItemfile;
        $scope.selectedCampaign.rejectedFiles;
        // edit mode - save media plan along with line item
        $scope.showConfirmPopupCreate = false;
        $scope.showConfirmPopupEdit = false;
        $scope.showConfirmPopupBulkUpload = false;
        $scope.correctLineItems=[];



/*---START------BULK LineItem Upload Section---------*/

        /*function to download empty template*/
        $scope.downloadTemplate=function(){
            var   url = vistoconfig.apiPaths.WORKFLOW_API_URL +'/lineitems/downloadTemplate';
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
        }

        /*show bulkupload section on click of export lineItem*/
        $scope.showBulkUploadsection=function(){
            $('.upload_files_selected_container').slideDown();
            $('.common_file_upload_container').slideDown();

        }

        /* once file is selected, hide the dragover box*/
        $scope.fileSelected=function(file,action){
            if($scope.selectedCampaign.lineItemfile && action=='edit'){
                $('.common_file_upload_container').hide();
            }
        }
        var lineItemCreateBulkUpload=function () {
            for(var index=0;index<$scope.correctLineItems.length;index++) {
                var newItem = {};
                newItem.lineItemType={};
                newItem.name = $scope.correctLineItems[index].name;
                console.log("RateType::",$scope.type);
                var objectIndex = _.findIndex($scope.type, function (type) {
                    return type.id === $scope.correctLineItems[index].billingTypeId
                });
                if(objectIndex>=0){
                    newItem.lineItemType = $scope.type[objectIndex];
                }
                newItem.pricingMethodId = $scope.correctLineItems[index].billingTypeId;
                newItem.adGroupName = $scope.correctLineItems[index].adGroupName;
                newItem.billableAmount = $scope.correctLineItems[index].billableAmount;
                newItem.volume = $scope.correctLineItems[index].volume;
                // in case pricerate is 30% markup remove the Markup
                //if (typeof $scope.pricingRate === "string") {
                //    newItem.pricingRate = Number($scope.billingRate.split('%')[0]);
                //} else {
                newItem.pricingRate = Number($scope.correctLineItems[index].billingRate);
                // }
                newItem.startTime = momentService.utcToLocalTime($scope.correctLineItems[index].startTime);
                newItem.endTime = momentService.utcToLocalTime($scope.correctLineItems[index].endTime);
                if(newItem.startTime < $scope.selectedCampaign.startTime || newItem.endTime > $scope.selectedCampaign.endTime){
                    return false;
                }
                newItem.campaignId = (campaignId === '-999') ? '-999' : campaignId;

                if ($scope.correctLineItems[index].pixelId) {
                    var objectIndex = _.findIndex($scope.selectedCampaign.pixelList, function (type) {
                        return type.id === $scope.correctLineItems[index].pixelId
                    });
                    newItem.pixel = $scope.selectedCampaign.pixelList[objectIndex];
                    newItem.pixelId = $scope.selectedCampaign.pixelList[objectIndex].id;
                }

                if($scope.correctLineItems[index].vendorConfigId){
                    var indexSor=_.findIndex($scope.selectedCampaign.systemOfRecord,function (type){
                        return type.id==$scope.correctLineItems[index].vendorConfigId
                    })
                    newItem.systemOfRecordSelected = $scope.selectedCampaign.systemOfRecord[indexSor];
                    newItem.vendorConfigId = $scope.selectedCampaign.systemOfRecord[indexSor].id;
                }

                if (doesLineItemExceedBudget(newItem.billableAmount, $scope.Campaign.deliveryBudget)) {
                    return false;
                }

                $scope.lineItems.lineItemList.push(newItem);
                $scope.calculateLineItemTotal();
                // $scope.selectedCampaign.resetLineItemParameters();

            }
        }

        /*Function to upload the csv file selected, Based on response, show popUp with number of success-failure-errorLog download link
        * call getLineItems() to get the saved and newly uploaded line items*/
        $scope.$parent.uploadFileChosenLineItem = function(uploadMode) {
            //if we have to save the media plan prior to line item
            $scope.showConfirmPopupBulkUpload = false;
            if($scope.saveMediaPlan){
                //this is temp save in case we need to save media plan before line item
                workflowService.setLineItemBulkData($scope.selectedCampaign.lineItemfile);

                //show popup
                $scope.showConfirmPopupBulkUpload = true;
            }else if(uploadMode=='create'){
                if($scope.selectedCampaign.lineItemfile){
                    //bulk upload loader flag
                    $scope.bulkUploadItemLoaderEdit = true;

                        var clientId = ($scope.selectedCampaign.clientId)? $scope.selectedCampaign.clientId:loginModel.getSelectedClient().id;
                    var url= vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/advertiser/' + $scope.selectedCampaign.advertiserId
                        + '/lineitems/parseCSV?campaignEndDate='+$scope.selectedCampaign.endTime;

                    (function(file) {
                        Upload.upload({
                            url: url,
                            fileFormDataName: 'lineitemList',
                            file: $scope.selectedCampaign.lineItemfile
                        }).then(function (response) {
                            $scope.bulkUploadItemLoaderEdit = false;
                            $scope.$parent.successfulRecords = response.data.data.success;
                            $scope.verifiedItems=response.data.data.success;
                            $scope.$parent.errorRecords = response.data.data.failure;
                            $scope.$parent.errorRecordsFileName = response.data.data.logFileDownloadLink;
                            if ($scope.$parent.errorRecords.length > 0) {
                                $scope.$parent.bulkUploadResultHeader += ' - Errors found';
                            }
                            $scope.showUploadRecordsMessageLineItems = true;
                            $scope.correctLineItems.length=0;
                            var correctLineItem={};
                            for(var i=0; i<$scope.verifiedItems.length;i++){
                                correctLineItem=$scope.verifiedItems[i].lineitem;
                                correctLineItem.adGroupName=$scope.verifiedItems[i].adGroupName;
                                $scope.correctLineItems.push(correctLineItem);
                                console.log("correctLineItem",correctLineItem);

                            }
                            console.log($scope.correctLineItems);
                            /*Function insert verified line items to newItem and push to lineItems.lineItemList array to display on UI*/
                            lineItemCreateBulkUpload($scope.correctLineItems);
                            $scope.clearFileSelected();
                            //bulk upload loader

                        }, function (response) {
                            $scope.uploadBusy = false;
                            $scope.uploadErrorMsg = "Unable to upload the file.";
                            //bulk upload loader
                            $scope.bulkUploadItemLoaderEdit = false;
                        });
                    })($scope.selectedCampaign.lineItemfile);
                }

            }else if(uploadMode=='edit'){
                if($scope.selectedCampaign.lineItemfile){
                    //bulk upload loader flag
                    $scope.bulkUploadItemLoaderEdit = true;

                    var clientId = ($scope.selectedCampaign.clientId)? $scope.selectedCampaign.clientId:loginModel.getSelectedClient().id;
                    var url= vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/campaigns/' + $routeParams.campaignId
                        + '/lineitems/bulkUpload';

                    (function(file) {
                        Upload.upload({
                            url: url,
                            fileFormDataName: 'lineitemList',
                            file: $scope.selectedCampaign.lineItemfile
                        }).then(function (response) {
                            $scope.$parent.successfulRecords = response.data.data.success;
                            $scope.$parent.errorRecords = response.data.data.failure;
                            $scope.$parent.errorRecordsFileName = response.data.data.logFileDownloadLink;
                            if ($scope.$parent.errorRecords.length > 0) {
                                $scope.$parent.bulkUploadResultHeader += ' - Errors found';
                            }
                            $scope.showUploadRecordsMessageLineItems = true;
                            //make lineitems call n refresh that data
                            workflowService.getLineItem($routeParams.campaignId, true).then(function (results) {
                                if (results.status === 'success' && results.data.statusCode === 200) {
                                    $scope.lineItems.lineItemList = [];
                                    $scope.processLineItemEditMode(results.data.data);
                                }
                            });
                            $scope.clearFileSelected();
                            //bulk upload loader
                            $scope.bulkUploadItemLoaderEdit = false;
                        }, function (response) {
                            $scope.uploadBusy = false;
                            $scope.uploadErrorMsg = "Unable to upload the file.";
                            //bulk upload loader
                            $scope.bulkUploadItemLoaderEdit = false;
                        });
                    })($scope.selectedCampaign.lineItemfile);
                }
            }

        };

        $scope.cancelMediaPlanUpload = function(){
            $scope.showConfirmPopupBulkUpload = false;
            $scope.bulkUploadItemLoaderEdit = false;
        }

        /*Function to download error log, when some rows in upload fails to upload*/
        $scope.downloadErrorLog=function(url){
            var downloadErrorurl=vistoconfig.apiPaths.WORKFLOW_API_URL +''+url.slice(16,url.length);
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
        }

        /*function to close the Success/Error popUp after uploading the csv file*/
        $scope.hideuploadFileChosenLineItem = function() {
            $scope.showUploadRecordsMessageLineItems = false ;
        }

        /*Reset lineItem bulkUpload part in the UI*/
        $scope.clearFileSelected=function(){
            $('.upload_files_selected_container').slideUp();
            $(".common_file_upload_container").slideUp();
            $scope.selectedCampaign.lineItemfile=undefined;
        }
        /*Reset the error notification for wrong file or large file */
        $scope.closeErrorMessage = function() {
            $scope.uploadErrorMsg = undefined;
            $scope.selectedCampaign.rejectedFiles=undefined;
        };

/*---END------BULK LineItem Upload Section---------*/

        $scope.showNewLineItemForm = function () {
            $scope.selectedCampaign.createItemList = true;
            $scope.lineItemErrorFlag = false;
            setCogsValue(); // update type arr and selected advertiser

            $scope.initiateLineItemDatePicker();
        }

        $scope.createNewLineItem = function (mode, lineItemObj) {
            var newItem = {};
            if (mode === 'create' ) {
                if ($scope.lineItemName != '') {
                    newItem = createLineItemObj(lineItemObj);

                    if(doesLineItemExceedBudget(newItem.billableAmount,$scope.Campaign.deliveryBudget)){
                        return false;
                    }

                    $scope.lineItems.lineItemList.push(newItem);
                    $scope.selectedCampaign.resetLineItemParameters();
                }
            } else {
                newItem = createEditLineItemObj(oldLineItem);
                $scope.lineItems.lineItemList.push(newItem);
            }
            $scope.calculateLineItemTotal();
        };

        $scope.$parent.createNewLineItemInEditMode = function () {
            var newItem,
                tempBudget;
            // this is kept to initially create object in case we have to save it in service - line item edit mode- save media plan q
            newItem = createLineItemObj();


            //calc budget for validation against campaign budget
            //tempBudget = $scope.selectedCampaign.lineItemBillableAmountTotal;
            //tempBudget = Number(tempBudget) + Number(newItem.billableAmount);
            //if (tempBudget > $scope.Campaign.deliveryBudget) {

            if(doesLineItemExceedBudget(newItem.billableAmount,$scope.Campaign.deliveryBudget)){
                return false;
            }


            //if we have to save the media plan prior to line item
            $scope.showConfirmPopupCreate = false;
            if($scope.saveMediaPlan){
                //this is temp save in case we need to save media plan before line item
                workflowService.setLineItemData(newItem);

                //show popup
                $scope.showConfirmPopupCreate = true;
            } else {
                //this is temp save in case we need to save media plan before line item
                newItem = workflowService.getLineItemData();
                if(!newItem){
                    newItem = createLineItemObj();
                }
                //loader for save button
                $scope.Campaign.createNewLineItemLoaderEdit = true;

                newItem.startTime = momentService.localTimeToUTC(newItem.startTime, 'startTime');
                newItem.endTime = momentService.localTimeToUTC(newItem.endTime, 'endTime');

                // in case pricerate is 30% markup remove the Markup
                if(typeof newItem.pricingRate === "string"){
                    newItem.pricingRate = Number(newItem.pricingRate.split('%')[0]);
                }

                //else just save line item
                workflowService.createLineItems($scope.selectedCampaign.campaignId, $scope.selectedCampaign.clientId, newItem).then(function (results) {
                    if (results.status === 'success' && results.data.statusCode === 201) {
                        var campaignObj = $scope.createCampaignAccess();
                        campaignObj.fetchLineItemDetails($scope.selectedCampaign.campaignId);
                        $scope.selectedCampaign.resetLineItemParameters();
                        newItem = createLineItemObj();
                        workflowService.setLineItemData(null);
                    } else {
                        $rootScope.setErrAlertMessage(results.data.data.message );
                        workflowService.setLineItemData(null);
                        //hide loader
                        $scope.createNewLineItemLoader = false;
                        $scope.Campaign.createNewLineItemLoaderEdit = false;
                    }
                    //hide loader
                    $scope.createNewLineItemLoader = false;
                    $scope.Campaign.createNewLineItemLoaderEdit = false;
                });
            }


        };

        $scope.cancelMediaPlanCreation = function(){
            $scope.showConfirmPopupCreate = false;
            $scope.Campaign.createNewLineItemLoaderEdit = false;
        }

        $scope.$parent.updateLineItemInEditMode = function () {
            var newItem,
                tempBudget;
            //this hack is to make it work in edit mode when media plan save is requierd prior to line item
            //check if we have saved line item details in service or create a new line item object
            newItem = workflowService.getLineItemDataEdit()
            if(!newItem){
                newItem = createEditLineItemObj(angular.copy(oldLineItem));
            }


            //tempBudget = $scope.selectedCampaign.lineItemBillableAmountTotal;
            //tempBudget = (Number(tempBudget) - Number(oldLineItem.billableAmount)) + Number(newItem.billableAmount);
            if(doesLineItemExceedBudget(newItem.billableAmount,$scope.Campaign.deliveryBudget)){
                return false;
            }

            //if we have to save the media plan prior to line item
            $scope.showConfirmPopupEdit = false;
            if($scope.saveMediaPlan){
                //this is temp save in case we need to save media plan before line item
                workflowService.setLineItemDataEdit(newItem);

                //show popup
                $scope.showConfirmPopupEdit = true;
            } else {
                //this is temp save in case we need to save media plan before line item
                newItem = workflowService.getLineItemDataEdit();

                //loader for update buton
                $scope.editLineItemLoaderEdit = true;

                if(!newItem){
                    newItem = createEditLineItemObj(angular.copy(oldLineItem));
                }

                newItem.startTime = momentService.localTimeToUTC(newItem.startTime, 'startTime');
                newItem.endTime = momentService.localTimeToUTC(newItem.endTime, 'endTime');

                // in case pricerate is 30% markup remove the Markup
                if(typeof newItem.pricingRate === "string"){
                    newItem.pricingRate = Number(newItem.pricingRate.split('%')[0]);
                }

                // update line item
                workflowService.updateLineItems($scope.selectedCampaign.campaignId, $scope.selectedCampaign.clientId, newItem).then(function (results) {
                    if (results.status === 'success' && (results.data.statusCode === 200 || results.data.statusCode === 201)) {
                        var campaignObj = $scope.createCampaignAccess();
                        campaignObj.fetchLineItemDetails($scope.selectedCampaign.campaignId);
                        $scope.calculateLineItemTotal();
                        workflowService.setLineItemDataEdit(null);

                    } else {
                        $rootScope.setErrAlertMessage(results.data.data.message );
                    }
                    $scope.editLineItemLoader = false;
                    $scope.editLineItemLoaderEdit = false;

                });
            }
        };

        $scope.cancelMediaPlanCreationEdit = function(){
            $scope.showConfirmPopupEdit = false;
            $scope.editLineItemLoaderEdit = false;

        }

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
            // in case pricerate is 30% markup remove the Markup
            if(typeof $scope.pricingRate === "string"){
                newItem.pricingRate = Number($scope.pricingRate.split('%')[0]);
            } else {
                newItem.pricingRate = $scope.pricingRate;
            }
            newItem.startTime = $scope.lineItemStartDate;
            newItem.endTime = $scope.lineItemEndDate;
            if($scope.pixelSelected){
                newItem.pixel = $scope.pixelSelected;
                newItem.pixelId = $scope.pixelSelected.id;
            }

            if($scope.systemOfRecordSelected){
                newItem.systemOfRecordSelected = $scope.systemOfRecordSelected;
                newItem.vendorConfigId = $scope.systemOfRecordSelected.id; // vendorConfigId is the parameter backend acceptes
            }

            newItem.campaignId = campaignId;
            //this is in case of edit mode where line item has id
            if (lineItemObj) {
                newItem.id = lineItemObj.id;
                newItem.updatedAt = lineItemObj.updatedAt;
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
            // in case pricerate is 30% markup remove the Markup
            if(typeof $scope.editLineItem.pricingRate === "string"){
                newItem.pricingRate = Number($scope.editLineItem.pricingRate.split('%')[0]);
            } else {
                newItem.pricingRate = $scope.editLineItem.pricingRate;
            }
            newItem.startTime = $scope.editLineItem.startTime;
            newItem.endTime = $scope.editLineItem.endTime;
            newItem.pixel = $scope.editLineItem.pixelSelected;
            newItem.pixelId = $scope.editLineItem.pixelSelected.id;
            newItem.systemOfRecordSelected = $scope.editLineItem.systemOfRecordSelected;
            newItem.vendorConfigId = $scope.editLineItem.systemOfRecordSelected.id; // vendorConfigId is the parameter backend acceptes
            newItem.campaignId = (campaignId === '-999') ? '-999' : campaignId; // handle real edit mode

            //this is in case of edit mode where line item has id
            if (lineItemObj) {
                newItem.id = lineItemObj.id;
                newItem.updatedAt = lineItemObj.updatedAt;
            }
            //$scope.calculateLineItemTotal();
            return newItem;
        }


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
                        $scope.pricingRate = selectedAdvertiser.billingValue + "% Markup";// to get via advertiser api
                        $('.lineItemType').html('<span class="text" data-ng-bind="lineItemType.name">'+$scope.lineItemType.name+'</span> <span class="icon-arrow-down"></span>');
                    }

                    $scope.volumeFlag = false;
                    $scope.volume = '';
                }
                else if (CONST_COGS_CPM === $scope.lineItemType.name) {
                    if (selectedAdvertiser && (selectedAdvertiser.billingTypeId && selectedAdvertiser.billingValue)) {
                        $scope.rateReadOnly = true;
                        $scope.pricingRate = selectedAdvertiser.billingValue;// to get via advertiser api
                    }
                    $scope.volumeFlag = false;
                    $scope.volume = '';
                }
                else if (CONST_FLAT_FEE === $scope.lineItemType.name) {
                    if (selectedAdvertiser && (selectedAdvertiser.billingTypeId && selectedAdvertiser.billingValue)) {
                        $scope.rateReadOnly = true;
                        $scope.pricingRate = selectedAdvertiser.billingValue;// to get via advertiser api
                    }
                    $scope.hideAdGroupName = true;
                    $scope.hideLineItemRate = true;
                    $scope.pricingRate = '0';

                    $scope.volumeFlag = false;
                    $scope.volume = '';
                    //$scope.amountFlag = false;
                    $scope.billableAmount = '';
                    $scope.systemOfRecordSelected = {};
                    $scope.systemOfRecordSelected.name = 'Select from list';
                    $('.systemOfRecordName').html('<span class="text" data-ng-bind="systemOfRecordSelected.name">Select from list</span> <span class="icon-arrow-down"></span>');
                    $scope.showSystemOfRecord = false;
                }
                else if (CONST_POST_IMPRESSION_CPA === $scope.lineItemType.name || CONST_TOTAL_CPA === $scope.lineItemType.name || CONST_POST_CLICK_CPA === $scope.lineItemType.name) {
                    $scope.showPixelsList = true;
                }
            } else {
                $scope.rateReadOnlyEdit = false;
                $scope.billableAmount = '';
                $scope.volumeFlagEdit = true;
                $scope.amountFlagEdit = true;
                $scope.hideLineItemRateEdit = false;
                $scope.hideAdGroupNameEdit = false;
                $scope.showPixelsListEdit = false;
                $scope.showSystemOfRecordEdit = true;

                //$scope.editLineItem.pricingRate = (obj.pricingRate)?obj.pricingRate:'';

                /*  this is to set line ad group name to line item name in case adGroup is empty
                    this is to not blindly set ad group name to line item name in create mode */
                if($scope.editLineItem.adGroupName === ''){
                    $scope.editLineItem.adGroupName =  $scope.editLineItem.lineItemName;
                }

                if (CONST_COGS_PERCENT === $scope.editLineItem.lineItemType.name) {

                    if (selectedAdvertiser && (selectedAdvertiser.billingTypeId && selectedAdvertiser.billingValue)) {
                        $scope.rateReadOnlyEdit = true;
                        $scope.editLineItem.pricingRate = selectedAdvertiser.billingValue+ "% Markup";// to get via advertiser api
                        $scope.rateTypeReadOnlyEdit = true;
                    }
                    $scope.volumeFlagEdit = false;
                    $scope.editLineItem.volume = '';
                    $scope.editLineItem.pixelSelected = {};

                }
                else if (CONST_COGS_CPM === $scope.editLineItem.lineItemType.name) {
                    if (selectedAdvertiser && (selectedAdvertiser.billingTypeId && selectedAdvertiser.billingValue)) {
                        $scope.rateReadOnlyEdit = true;
                        $scope.editLineItem.pricingRate = selectedAdvertiser.billingValue;// to get via advertiser api
                        $scope.rateTypeReadOnlyEdit = true;
                    }
                    $scope.volumeFlagEdit = false;
                    $scope.editLineItem.volume = '';
                    $scope.editLineItem.pixelSelected = {};
                }
                else if (CONST_FLAT_FEE === $scope.editLineItem.lineItemType.name) {
                    if (selectedAdvertiser && (selectedAdvertiser.billingTypeId && selectedAdvertiser.billingValue)) {
                        $scope.rateReadOnlyEdit = true;
                        $scope.editLineItem.pricingRate = selectedAdvertiser.billingValue;// to get via advertiser api
                        $scope.rateTypeReadOnlyEdit = true;
                    }
                    $scope.hideLineItemRateEdit = true;
                    $scope.editLineItem.pricingRate = '0';

                    $scope.volumeFlagEdit = false;
                    $scope.editLineItem.volume = '';
                    //ad group in edit mode
                    $scope.hideAdGroupNameEdit = true;
                    $scope.editLineItem.adGroupName = '';
                    $scope.editLineItem.pixelSelected = {};
                    $scope.editLineItem.systemOfRecordSelected = {};
                    $scope.editLineItem.systemOfRecordSelected.name = 'Select from list';
                    // $('.systemOfRecordNameEdit').html('<span class="text" data-ng-bind="editLineItem.systemOfRecordSelected.name">'+ $scope.editLineItem.systemOfRecordSelected.name +'</span> <span class="icon-arrow-down"></span>');
                    $scope.showSystemOfRecordEdit = false;
                }
                else if (CONST_POST_IMPRESSION_CPA === $scope.editLineItem.lineItemType.name || CONST_TOTAL_CPA === $scope.editLineItem.lineItemType.name || CONST_POST_CLICK_CPA === $scope.editLineItem.lineItemType.name) {
                    $scope.showPixelsListEdit = true;
                    if(_.isEmpty($scope.editLineItem.pixelSelected)){
                        $scope.editLineItem.pixelSelected = {};
                        $scope.editLineItem.pixelSelected.name = 'Select from list';
                        // $('.pixelTypeEdit').html('<span class="text" data-ng-bind="editLineItem.pixelSelected.name">Select from list</span> <span class="icon-arrow-down"></span>');
                        $scope.editLineItem.pixelSelected.id = '';
                    }


                }
            }

            //trigger volume calculation
            $scope.calculateVolume(mode);
        };


        $scope.selectedCampaign.resetLineItemParameters = function () {
            $scope.lineItemName = '';
            $scope.lineItemType = {};
            $scope.lineItemType.name = 'Select Type';
            $scope.lineItemType.id = '';
            $scope.pixelSelected = {};
            $scope.systemOfRecordSelected = {};

            $('.lineItemType').html('<span class="text" data-ng-bind="lineItemType.name">Select Type</span> <span class="icon-arrow-down"></span>');
            $('.pixelType').html('<span class="text" data-ng-bind="pixelSelected.name">Select from list</span> <span class="icon-arrow-down"></span>');
            $('.systemOfRecordName').html('<span class="text" data-ng-bind="systemOfRecordSelected.name">Select from list</span> <span class="icon-arrow-down"></span>');

            $scope.volume = '';
            $scope.billableAmount = '';
            $scope.pricingRate = '';
            $scope.adGroupName = '';
            $scope.lineTarget = '';
            $scope.selectedCampaign.createItemList = false;

            $scope.rateReadOnly = false;
            $scope.volumeFlag = true;
            $scope.amountFlag = true;
            $scope.hideAdGroupName = false;
            $scope.showPixelsList = false;
            $scope.showSystemOfRecordEdit = true;
            //$scope.type = angular.copy(workflowService.getRateTypes());
        }


        //Line Item Table Row Edit
        $scope.showEditItemRow = function (event, lineItem) {
            oldLineItem = angular.copy(lineItem);
            oldLineItemIndex = _.findIndex($scope.lineItems.lineItemList, function (item) {
                if (item.name === oldLineItem.name && item.billingTypeId === oldLineItem.billingTypeId && item.pricingRate === oldLineItem.pricingRate) {
                    return true;
                }
            });
            $(".tr .tableNormal").show();
            $(".tr .tableEdit").hide();

            var target = event.currentTarget;
            $(target).toggle();
            $(target).closest('.tr').find('.tableEdit').toggle();

            setCogsValue(); // update type arr and selected advertiser

            //disable flat fee in case the user created media plan with line item with rate type other than FLAT FEE
            if($scope.mode === 'edit'){
                $scope.showConfirmPopupEdit = false ;
                $scope.disableFlatFeeEdit = false;
                $scope.rateTypeReadOnlyEdit = false;
                if(lineItem.lineItemType.name !== CONST_FLAT_FEE){
                    $scope.disableFlatFeeEdit = true;
                } else {
                    $scope.rateTypeReadOnlyEdit = true;
                }
            }

            //populate edit lineitem fields
            populateLineItemEdit(event, lineItem);

        };

        $scope.updateLineItem = function (newItem) {
            if(doesLineItemExceedBudget($scope.editLineItem.billableAmount,$scope.Campaign.deliveryBudget)){
                return false;
            }

            $scope.deleteLineItem(false);
            $scope.createNewLineItem('edit');
        }

        $scope.deleteLineItem = function (deleteFlag) {
            var index = _.findIndex($scope.lineItems.lineItemList, function (item) {
                if (item.name === oldLineItem.name && item.billingTypeId === oldLineItem.billingTypeId && item.pricingRate === oldLineItem.pricingRate) {
                    return true;
                }
            });

            if ($scope.mode === 'create' || $scope.cloneMediaPlanName) {
                $scope.lineItems.lineItemList.splice(index, 1);
            }
            else {
                workflowService.deleteLineItem(oldLineItem, $scope.selectedCampaign.clientId) // not used right now
            }
            $scope.calculateLineItemTotal();
        }

        //validate Line Item Flight Dates
        $scope.validateDateLineItem = function (startTime, endTime, endElemId) {
            var endDateElem = $('#' + endElemId)
            var changeDate;

            if ($scope.mode !== 'edit') {

                if (startTime && moment(startTime).isAfter(endTime)) {
                    endDateElem.removeAttr("disabled").css({'background': 'transparent'});
                    changeDate = moment(startTime).format(constants.DATE_US_FORMAT);
                    endDateElem.datepicker("setStartDate", changeDate);
                    endDateElem.datepicker("update", changeDate);
                } else {
                    endDateElem.removeAttr("disabled").css({'background': 'transparent'});
                    endDateElem.datepicker("setStartDate", startTime);
                    endDateElem.datepicker("update", endTime);
                }
                $scope.updateLineItemCreateDate();

            } else {

                if (moment(endTime).isBefore(moment(startTime))) {
                    endDateElem.removeAttr("disabled").css({'background': 'transparent'});
                    endDateElem.datepicker("setStartDate", startTime);
                    endDateElem.datepicker("update", endTime);
                } else {
                    endDateElem.removeAttr("disabled").css({'background': 'transparent'});
                    endDateElem.datepicker("setStartDate", startTime);
                    endDateElem.datepicker("update", endTime);
                }
            }
            if (moment(startTime).isAfter(endTime, 'day')) {
                endDateElem.datepicker("update", startTime);
            }

        }

        //populate line item in case of edit and cancel of edit
        function populateLineItemEdit(event, lineItem) {
            var today = momentService.utcToLocalTime(),
                target = $(event.target),
                index,
                lineItemStartDateElem,
                lineItemEndDateElem;

            index = target.parents('.tr').find(".tableEdit").attr("data-table-index");
            lineItemStartDateElem = $('#editLineItemStartDate' + index);
            lineItemEndDateElem = $('#editLineItemEndDate' + index);


            $scope.editLineItem.lineItemName = lineItem.name;
            $scope.editLineItem.lineItemType = lineItem.lineItemType;
            $scope.editLineItem.pixelSelected = lineItem.pixel;
            $scope.editLineItem.systemOfRecordSelected = lineItem.systemOfRecordSelected;
            $scope.editLineItem.pricingRate = lineItem.pricingRate;
            $scope.editLineItem.billableAmount = lineItem.billableAmount;
            $scope.editLineItem.volume = lineItem.volume;

            //if pixel is empty show select from list in edit section for create/edit mode
            if(_.isEmpty($scope.editLineItem.pixelSelected)){
                $scope.editLineItem.pixelSelected = {};
                $scope.editLineItem.pixelSelected.name = 'Select from list';
                $scope.editLineItem.pixelSelected.id = '';
                // $('.pixelTypeEdit').html('<span class="text" data-ng-bind="editLineItem.pixelSelected.name">Select from list</span> <span class="icon-arrow-down"></span>');
            }


            //set line Item End Date
            if (lineItem.endTime) {
                $scope.editLineItem.endTime = lineItem.endTime;
            }

            //set line Item start Date
            if (lineItem.startTime) {
                $scope.editLineItem.startTime = lineItem.startTime;
                lineItemStartDateElem.datepicker("setStartDate", $scope.selectedCampaign.startTime);
                lineItemStartDateElem.datepicker("update", lineItem.startTime);
            }
            if (lineItem.adGroupName) {
                $scope.editLineItem.adGroupName = lineItem.adGroupName;
            }

            lineItemStartDateElem.datepicker("setEndDate", $scope.selectedCampaign.endTime);
            lineItemEndDateElem.datepicker("setEndDate", $scope.selectedCampaign.endTime);

            $scope.setLineItem($scope.editLineItem.lineItemType, 'edit');
            $scope.setPixels($scope.editLineItem.pixelSelected, 'edit')
        }

        // ******** Line item edit mode ******
        $scope.$parent.processLineItemEditMode = function (lineItemList) {
            $scope.lineItems.lineItemList.length = 0;
            _.each(lineItemList, function (item) {
                $scope.lineItemName = item.name;
                var index = _.findIndex($scope.type, function (type) {
                    return type.id === item.billingTypeId;
                });
                if(index != -1){
                    $scope.setLineItem($scope.type[index], 'create');
                }
                //pixel
                if (item.pixelId) {
                    var pixelIndex = _.findIndex($scope.selectedCampaign.pixelList, function (type) {
                        return type.id === item.pixelId;
                    });
                    if(pixelIndex != -1){
                        $scope.pixelSelected = $scope.selectedCampaign.pixelList[pixelIndex];
                        $scope.pixelSelected.id = item.pixelId;
                    }
                }
                //SOR
                if (item.vendorConfigId) {
                    var sorIndex = _.findIndex($scope.selectedCampaign.systemOfRecord, function (type) {
                        return type.id === item.vendorConfigId;
                    });
                    if(sorIndex != -1){
                        $scope.systemOfRecordSelected = $scope.selectedCampaign.systemOfRecord[sorIndex];
                        $scope.systemOfRecordSelected.id = item.vendorConfigId;
                    }
                }
                $scope.hideAdGroupNameEdit = true;
                $scope.lineItemType.id = item.billingTypeId;
                $scope.billableAmount = item.billableAmount;
                $scope.volume = item.volume;
                $scope.pricingRate = item.billingRate;

                //line start Date
                $scope.lineItemStartDate = momentService.utcToLocalTime(item.startTime)  ;

                //line Item End Date
                $scope.lineItemEndDate = momentService.utcToLocalTime(item.endTime)  ;


                 //line Item End Date
                $scope.lineItemEndDate = momentService.utcToLocalTime(item.endTime)  ;

                if( $scope.campaignDate ) {

                    $scope.lineItemdiffDays = momentService.dateDiffInDays($scope.lineItemStartDate,$scope.lineItemEndDate) ;
                }
                if( $scope.campaignDate && $scope.flightDateChosen == "automaticFlightDates" ) {
                    if( !$scope.ifClonedDateLessThanStartDate ) {
                        $scope.lineItemStartDate = momentService.addDaysCustom($scope.lineItemStartDate, 'MM/DD/YYYY', $scope.newdiffDays);
                        $scope.lineItemEndDate = momentService.addDaysCustom($scope.lineItemEndDate, 'MM/DD/YYYY', $scope.newdiffDays);
                    } else {
                        $scope.lineItemStartDate = momentService.substractDaysCustom($scope.lineItemStartDate, 'MM/DD/YYYY', $scope.lessdiffDays) ;
                        $scope.lineItemEndDate = momentService.addDaysCustom($scope.lineItemStartDate , 'MM/DD/YYYY', $scope.lineItemdiffDays );
                    }
                }


                campaignId = item.campaignId;
                $scope.createNewLineItem('create', item);

            })
        };

        // line item date picker
        $scope.initiateLineItemDatePicker = function () {
            var startDateElem = $('#lineItemStartDateInput'),
                endDateElem = $('#lineItemEndDateInput'),
                today = momentService.utcToLocalTime();

            $scope.campaignStartDate = $scope.lineItemStartDate = $scope.selectedCampaign.startTime;
            $scope.campaignEndDate = $scope.lineItemEndDate = $scope.selectedCampaign.endTime;

            //line Item start Date
            startDateElem.datepicker("setStartDate", $scope.campaignStartDate);
            startDateElem.datepicker("update", $scope.campaignStartDate);
            startDateElem.datepicker("setEndDate", $scope.campaignEndDate);

            //line Item End Date
            endDateElem.datepicker("setStartDate", $scope.campaignStartDate);
            endDateElem.datepicker("update", $scope.campaignEndDate);
            endDateElem.datepicker("setEndDate", $scope.campaignEndDate);


        };

        $scope.setPixels = function (pixel, mode) {
            if (mode === 'create') {
                $scope.pixelSelected = pixel;
            } else {
                $scope.editLineItem.pixelSelected = pixel;
            }

        }

        $scope.setSystemOfRecord = function (sor, mode) {
            if (mode === 'create') {
                $scope.systemOfRecordSelected = sor;
            } else {
                $scope.editLineItem.systemOfRecordSelected = sor;
            }

        }

        $scope.hideLineItemEditRow = function (event) {
            var target = event.currentTarget;
            $scope.lineItems.lineItemList[oldLineItemIndex] = oldLineItem;
            $(target).closest('.tr').find('.tableNormal').toggle();
            $(target).closest('.tr').find('.tableEdit').toggle();
        };

        $scope.$parent.filterLineItemBasedOnPixel = function (id) {
            var tempList = _.extend($scope.lineItems.lineItemList);

            for (var i = 0; i < tempList.length; i++) {
                if (tempList[i].pixelId && tempList[i].pixelId === id) {
                    tempList.splice(i, 1);
                }
            }
            $scope.lineItems.lineItemList = tempList;
        }

        $scope.calculateLineItemTotal = function(){
            $scope.selectedCampaign.lineItemBillableAmountTotal = 0;
            _.each($scope.lineItems.lineItemList,function(item){
                $scope.selectedCampaign.lineItemBillableAmountTotal += Number(item.billableAmount);
            })
        }

        $scope.calculateVolume = function(mode){

            if (CONST_COGS_PERCENT !== $scope.lineItemType.name && CONST_FLAT_FEE !== $scope.lineItemType.name && CONST_COGS_CPM !== $scope.lineItemType.name){
                if(mode === 'create'){
                    $scope.volume = '';
                    if($scope.lineItemType && $scope.lineItemType.name && $scope.pricingRate && $scope.billableAmount && $scope.pricingRate > 0){
                        if($scope.lineItemType.name === 'CPM') {
                            $scope.volume = ($scope.billableAmount / $scope.pricingRate ) * 1000;
                        } else {
                            $scope.volume = ($scope.billableAmount / $scope.pricingRate );
                        }
                        $scope.volume = Math.round($scope.volume);
                    } else {
                        $scope.volume = 0;
                    }
                } else {
                    $scope.editLineItem.volume = '';
                    if($scope.editLineItem.lineItemType && $scope.editLineItem.lineItemType.name && $scope.editLineItem.pricingRate && $scope.editLineItem.billableAmount && $scope.editLineItem.pricingRate > 0){
                        if($scope.editLineItem.lineItemType.name === 'CPM') {
                            $scope.editLineItem.volume = ($scope.editLineItem.billableAmount / $scope.editLineItem.pricingRate ) * 1000;
                        } else {
                            $scope.editLineItem.volume = ($scope.editLineItem.billableAmount / $scope.editLineItem.pricingRate );
                        }
                        $scope.editLineItem.volume = Math.round($scope.editLineItem.volume);
                    } else {
                         //. in case $scope.editLineItem.pricingRate is 0
                        $scope.editLineItem.volume = 0;
                    }
                }
            }

        };

        //TODO : need to make the change to optimise this code
        $scope.updateLineItemCreateDate = function(){
            $scope.lineItemStartDate = $('#lineItemStartDateInput').val();
            $scope.lineItemEndDate = $('#lineItemEndDateInput').val();
        }

        function setCogsValue(){
            selectedAdvertiser = workflowService.getAdvertiserTypeValue();
            if (selectedAdvertiser && (selectedAdvertiser.billingValue && selectedAdvertiser.billingTypeId)) {
                var index = _.findIndex($scope.type, function (item) {
                    return item.id ===  selectedAdvertiser.billingTypeId;
                });
                if(index != -1){
                    $scope.setLineItem($scope.type[index], 'create');
                }
            }
        }

        //shows error message if line item billable amount exceed media plan budget
        // return true if the line item budget exceeds media plan budget
        function doesLineItemExceedBudget(billableAmount,deliveryBudget){
            if (Number(billableAmount) > deliveryBudget) {
                $rootScope.setErrAlertMessage('Line Item budget cannot exceed media plan budget');
                return true;
            }
            return false;
        }
    });
});
