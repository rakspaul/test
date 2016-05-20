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
        $scope.CONST_FLAT_FEE = 'Flat Fee';
        $scope.pixelSelected = {};
        $scope.pixelSelected.name = 'Select from list';
        $scope.selectedCampaign.lineItemBillableAmountTotal = 0;
        $scope.selectedCampaign.createItemList = false;
        $scope.showUploadRecordsMessageLineItems = false;
        $scope.selectedCampaign.lineItemfile;

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

        /*Function to upload the csv file selected, Based on response, show popUp with number of success-failure-errorLog download link
        * call getLineItems() to get the saved and newly uploaded line items*/
        $scope.uploadFileChosenLineItem = function() {
            if($scope.selectedCampaign.lineItemfile){
                var clientId = loginModel.getSelectedClient().id;
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
                        $scope.$parent.bulkUploadResultHeader = "Upload complete"
                        if ($scope.$parent.errorRecords.length > 0) {
                            $scope.$parent.bulkUploadResultHeader += ' - Errors found';
                        }
                        $scope.showUploadRecordsMessageLineItems = true;
                        //make lineitems call n refresh that data
                        workflowService.getLineItem($routeParams.campaignId, true).then(function (results) {
                            if (results.status === 'success' && results.data.statusCode === 200) {
                                $scope.lineItemList = [];
                                $scope.processLineItemEditMode(results.data.data);
                            }
                        });
                        $scope.clearFileSelected();
                    }, function (response) {
                        $scope.uploadBusy = false;
                        $scope.uploadErrorMsg = "Unable to upload the file.";
                    });
                })($scope.selectedCampaign.lineItemfile);
            }
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

/*---END------BULK LineItem Upload Section---------*/

        $scope.showNewLineItemForm = function () {
            $scope.selectedCampaign.createItemList = true;
            $scope.lineItemErrorFlag = false;
            updateRateTypeArr(); // remove cogs+ in create and edit mode from rate type arr

            $scope.initiateLineItemDatePicker();
        }

        $scope.createNewLineItem = function (mode, lineItemObj) {
            var newItem = {};
            if (mode === 'create' ) {
                if ($scope.lineItemName != '') {
                    newItem = createLineItemObj(lineItemObj);
                    $scope.lineItemList.push(newItem);
                    $scope.selectedCampaign.resetLineItemParameters();
                }
            } else {
                newItem = createEditLineItemObj(oldLineItem);
                $scope.lineItemList.push(newItem);
            }
            $scope.calculateLineItemTotal();
        };

        $scope.createNewLineItemInEditMode = function () {
            var newItem,
                tempBudget;
            newItem = createLineItemObj();
            newItem.startTime = momentService.localTimeToUTC(newItem.startTime, 'startTime');
            newItem.endTime = momentService.localTimeToUTC(newItem.endTime, 'endTime');
            //calc budget for validation against campaign budget
            tempBudget = $scope.selectedCampaign.lineItemBillableAmountTotal;
            tempBudget = Number(tempBudget) + Number(newItem.billableAmount);
            if (tempBudget > $scope.Campaign.deliveryBudget) {
                $rootScope.setErrAlertMessage('Line Item budget cannot exceed media plan budget');
                return false;
            }
            workflowService.createLineItems($scope.selectedCampaign.campaignId, $scope.selectedCampaign.clientId, newItem).then(function (results) {
                console.log('result==', results)
                if (results.status === 'success' && results.data.statusCode === 201) {
                    var campaignObj = $scope.createCampaignAccess();
                    campaignObj.fetchLineItemDetails($scope.selectedCampaign.campaignId);
                    $scope.selectedCampaign.resetLineItemParameters();
                    newItem = createLineItemObj();
                }
            });
        };

        $scope.updateLineItemInEditMode = function () {
            var newItem,
                tempBudget;
            newItem = createEditLineItemObj(angular.copy(oldLineItem));
            newItem.startTime = momentService.localTimeToUTC(newItem.startTime, 'startTime');
            newItem.endTime = momentService.localTimeToUTC(newItem.endTime, 'endTime');
            tempBudget = $scope.selectedCampaign.lineItemBillableAmountTotal;
            tempBudget = (Number(tempBudget) - Number(oldLineItem.billableAmount)) + Number(newItem.billableAmount);
            if (tempBudget > $scope.Campaign.deliveryBudget) {
                $rootScope.setErrAlertMessage('Line Item budget cannot exceed media plan budget');
                return false;
            }
            workflowService.updateLineItems($scope.selectedCampaign.campaignId, $scope.selectedCampaign.clientId, newItem).then(function (results) {
                if (results.status === 'success' && (results.data.statusCode === 200 || results.data.statusCode === 201)) {
                    var campaignObj = $scope.createCampaignAccess();
                    campaignObj.fetchLineItemDetails($scope.selectedCampaign.campaignId);
                    $scope.calculateLineItemTotal();

                }

            });
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
            newItem.pricingRate = $scope.pricingRate;
            newItem.startTime = $scope.lineItemStartDate;
            newItem.endTime = $scope.lineItemEndDate;
            if($scope.pixelSelected){
                newItem.pixel = $scope.pixelSelected;
                newItem.pixelId = $scope.pixelSelected.id;
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
            newItem.pricingRate = $scope.editLineItem.pricingRate;
            newItem.startTime = $scope.editLineItem.startTime;
            newItem.endTime = $scope.editLineItem.endTime;
            newItem.pixel = $scope.editLineItem.pixelSelected;
            newItem.pixelId = $scope.editLineItem.pixelSelected.id;
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
                if (CONST_COGS_PERCENT === $scope.lineItemType.name) {
                    if (selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)) {
                        $scope.rateReadOnly = true;
                        $scope.pricingRate = selectedAdvertiser.billingValue + "% Markup";// to get via advertiser api
                        // manully setting parameter in type dropdown
                        var arr = [];
                        var index = _.findIndex($scope.type, function (item) {
                            return item.name === $scope.lineItemType.name;
                        });
                        arr.push($scope.type[index]);
                        var index1 = _.findIndex($scope.type, function (item) {
                            return item.name === CONST_FLAT_FEE;
                        })
                        arr.push($scope.type[index1]);
                        $scope.type = arr;

                    }

                    $scope.volumeFlag = false;
                    $scope.volume = '';
                }
                else if (CONST_COGS_CPM === $scope.lineItemType.name) {
                    if (selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)) {
                        $scope.rateReadOnly = true;
                        $scope.pricingRate = selectedAdvertiser.billingValue;// to get via advertiser api
                        //$scope.rateTypeReadOnly = true;
                        // manully setting parameter in type dropdown
                        var arr = [];
                        var index = _.findIndex($scope.type, function (item) {
                            return item.name === $scope.lineItemType.name
                        });
                        arr.push($scope.type[index]);
                        var index1 = _.findIndex($scope.type, function (item) {
                            return item.name === CONST_FLAT_FEE
                        })
                        arr.push($scope.type[index1]);
                        $scope.type = arr;
                    }
                    $scope.volumeFlag = false;
                    $scope.volume = '';
                }
                else if (CONST_FLAT_FEE === $scope.lineItemType.name) {
                    if (selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)) {
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
                //$scope.editLineItem.pricingRate = (obj.pricingRate)?obj.pricingRate:'';

                if (CONST_COGS_PERCENT === $scope.editLineItem.lineItemType.name) {

                    if (selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)) {
                        $scope.rateReadOnlyEdit = true;
                        $scope.editLineItem.pricingRate = selectedAdvertiser.billingValue;// to get via advertiser api
                        $scope.rateTypeReadOnlyEdit = true;
                    }
                    $scope.volumeFlagEdit = false;
                    $scope.editLineItem.volume = '';
                    $scope.editLineItem.pixelSelected = {};

                }
                else if (CONST_COGS_CPM === $scope.editLineItem.lineItemType.name) {
                    if (selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)) {
                        $scope.rateReadOnlyEdit = true;
                        $scope.editLineItem.pricingRate = selectedAdvertiser.billingValue;// to get via advertiser api
                        $scope.rateTypeReadOnlyEdit = true;
                    }
                    $scope.volumeFlagEdit = false;
                    $scope.editLineItem.volume = '';
                    $scope.editLineItem.pixelSelected = {};
                }
                else if (CONST_FLAT_FEE === $scope.editLineItem.lineItemType.name) {
                    if (selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)) {
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
                }
                else if (CONST_POST_IMPRESSION_CPA === $scope.editLineItem.lineItemType.name || CONST_TOTAL_CPA === $scope.editLineItem.lineItemType.name || CONST_POST_CLICK_CPA === $scope.editLineItem.lineItemType.name) {
                    $scope.showPixelsListEdit = true;
                    if(_.isEmpty($scope.editLineItem.pixelSelected)){
                        $('.pixelTypeEdit').html('<span class="text" data-ng-bind="pixelSelected.name">Select from list</span> <span class="icon-arrow-down"></span>');
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

            $('.lineItemType').html('<span class="text" data-ng-bind="lineItemType.name">Select Type</span> <span class="icon-arrow-down"></span>');
            $('.pixelType').html('<span class="text" data-ng-bind="pixelSelected.name">Select from list</span> <span class="icon-arrow-down"></span>');
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
            $scope.type = angular.copy(workflowService.getRateTypes());
        }


        //Line Item Table Row Edit
        $scope.showEditItemRow = function (event, lineItem) {
            oldLineItem = angular.copy(lineItem);
            oldLineItemIndex = _.findIndex($scope.lineItemList, function (item) {
                if (item.name === oldLineItem.name && item.billingTypeId === oldLineItem.billingTypeId && item.pricingRate === oldLineItem.pricingRate) {
                    return true;
                }
            });
            $(".tr .tableNormal").show();
            $(".tr .tableEdit").hide();

            var target = event.currentTarget;
            $(target).toggle();
            $(target).closest('.tr').find('.tableEdit').toggle();


            updateRateTypeArr(); // remove cogs+ in create and edit mode from rate type arr

            //disable flat fee in case the user created media plan with line item with rate type other than FLAT FEE
            if($scope.mode === 'edit'){
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
            $scope.deleteLineItem(false);
            $scope.createNewLineItem('edit');
        }

        $scope.deleteLineItem = function (deleteFlag) {
            var index = _.findIndex($scope.lineItemList, function (item) {
                if (item.name === oldLineItem.name && item.billingTypeId === oldLineItem.billingTypeId && item.pricingRate === oldLineItem.pricingRate) {
                    return true;
                }
            });

            if ($scope.mode === 'create' || $scope.cloneMediaPlanName) {
                $scope.lineItemList.splice(index, 1);
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
            $scope.editLineItem.pricingRate = lineItem.pricingRate;
            $scope.editLineItem.billableAmount = lineItem.billableAmount;
            $scope.editLineItem.volume = lineItem.volume;


            //set line Item End Date
            if (lineItem.endTime) {
                $scope.editLineItem.endTime = lineItem.endTime;
            }

            //set line Item start Date
            if (lineItem.startTime) {
                $scope.editLineItem.startTime = lineItem.startTime;
                lineItemStartDateElem.datepicker("setStartDate", lineItem.startTime);
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
            console.log("lineItemList",lineItemList.length);
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

                $scope.hideAdGroupNameEdit = true;
                $scope.lineItemType.id = item.billingTypeId;
                $scope.billableAmount = item.billableAmount;
                $scope.volume = item.volume;
                $scope.pricingRate = item.billingRate;

                //line start Date
                $scope.lineItemStartDate = momentService.utcToLocalTime(item.startTime);

                //line Item End Date
                $scope.lineItemEndDate = momentService.utcToLocalTime(item.endTime);

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

        $scope.hideLineItemEditRow = function (event) {
            var target = event.currentTarget;
            $scope.lineItemList[oldLineItemIndex] = oldLineItem;
            $(target).closest('.tr').find('.tableNormal').toggle();
            $(target).closest('.tr').find('.tableEdit').toggle();
        };

        $scope.$parent.filterLineItemBasedOnPixel = function (id) {
            var tempList = _.extend($scope.lineItemList);

            for (var i = 0; i < tempList.length; i++) {
                if (tempList[i].pixelId && tempList[i].pixelId === id) {
                    tempList.splice(i, 1);
                }
            }
            $scope.lineItemList = tempList;
            console.log(tempList);
        }

        $scope.calculateLineItemTotal = function(){
            $scope.selectedCampaign.lineItemBillableAmountTotal = 0;
            _.each($scope.lineItemList,function(item){
                $scope.selectedCampaign.lineItemBillableAmountTotal += Number(item.billableAmount);
            })
        }

        $scope.calculateVolume = function(mode){
            console.log("type == ",$scope.lineItemType.name,'$scope.pricingRate== ',$scope.pricingRate,'$scope.billableAmount==',$scope.billableAmount);

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

        function updateRateTypeArr(){
            selectedAdvertiser = workflowService.getSelectedAdvertiser();
            if (selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)) {

                var index = _.findIndex($scope.type, function (item) {
                    return item.id === selectedAdvertiser.billingType.id;
                });

                $scope.setLineItem($scope.type[index], 'create');
            } else {
                // in case the advertiser does not have billing type and billing value remove COGS + % from Rate Type list
                var index = _.findIndex($scope.type, function (type) {
                    return type.name === CONST_COGS_PERCENT;
                })
                $scope.type.splice(index, 1);
            }
        }
    });
});
