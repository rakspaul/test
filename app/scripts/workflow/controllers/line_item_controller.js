/**
 * Created by shrujan on 02/05/16.
 */
define(['angularAMD', 'common/services/constants_service', 'workflow/services/workflow_service','login/login_model','common/moment_utils'], function (angularAMD) {
    angularAMD.controller('LineItemController', function ($scope,  $rootScope,$routeParams, $locale, $location, $timeout,constants, workflowService,loginModel,momentService) {

        var selectedAdvertiser,
            campaignId = '-999',
            CONST_FLAT_FEE = 'Flat Fee',
            CONST_COGS_PERCENT = 'COGS+ %',
            CONST_COGS_CPM = 'COGS + CPM Markup',
            oldLineItem;

        $scope.showNewLineItemForm = function(){
            $scope.createItemList = true;
            selectedAdvertiser = workflowService.getSelectedAdvertiser();
            $scope.hideCOGS = false;

            if(selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)){

                var index = _.findIndex($scope.type, function (item) {
                    return item.id === selectedAdvertiser.billingType.id;
                });

                $scope.setLineItem($scope.type[index],'create');
            } else {
                // in case the advertiser does not have billing type and billing value remove COGS + % from Rate Type list
                $scope.hideCOGS = true;
                var index = _.findIndex($scope.type, function(type){
                    return type.name === CONST_COGS_PERCENT;
                })
                $scope.type.splice(index,1);
            }
        }


        $scope.createNewLineItem = function(mode) {
            var newItem = {};
            if(mode === 'create'){
                if($scope.lineItemName != ''){
                    newItem.name = $scope.lineItemName;
                    newItem.lineItemType = $scope.lineItemType;
                    newItem.pricingMethodId = $scope.lineItemType.id;
                    if($scope.hideAdGroupName) {
                        newItem.adGroupName = '';
                    } else {
                        newItem.adGroupName = ($scope.adGroupName === '') ? $scope.lineItemName:$scope.adGroupName;
                    }
                    newItem.billableAmount = $scope.billableAmount;
                    $scope.lineItemBillableAmountTotal += Number($scope.billableAmount);
                    newItem.volume = $scope.volume;
                    newItem.pricingRate = $scope.pricingRate;
                    newItem.startTime = $scope.lineItemStartDate;
                    newItem.endTime = $scope.lineItemEndDate;
                    newItem.campaignId = campaignId;
                    //$scope.totalBillableAmount +=  $scope.billableAmount;x
                    $scope.lineItemList.push(newItem);
                    $scope.resetLineItemParameters();
                }
            } else {
                newItem.name = $scope.editLineItem.lineItemName;
                newItem.lineItemType = $scope.editLineItem.lineItemType;
                newItem.pricingMethodId = $scope.editLineItem.lineItemType.id;
                newItem.adGroupName = $scope.editLineItem.adGroupName;
                $scope.lineItemBillableAmountTotal = $scope.lineItemBillableAmountTotal - Number(oldLineItem.billableAmount);
                newItem.billableAmount = $scope.editLineItem.billableAmount;
                $scope.lineItemBillableAmountTotal += Number($scope.editLineItem.billableAmount);
                newItem.volume = $scope.editLineItem.volume;
                newItem.pricingRate = $scope.editLineItem.pricingRate;
                newItem.startTime = $scope.editLineItem.startTime;
                newItem.endTime = $scope.editLineItem.endTime;
                newItem.campaignId = (campaignId === '-999')?'-999':campaignId; // handle real edit mode
                $scope.lineItemList.push(newItem);

            }

        };

        $scope.setLineItem = function(obj,mode){


            if(mode !== 'edit'){
                $scope.lineItemType = obj;
            } else {
                $scope.editLineItem.lineItemType = obj;
            }

            if(mode === 'create'){
                $scope.lineRate = '';
                $scope.rateReadOnly = false;
                $scope.volumeFlag = true;
                $scope.amountFlag = true;
                $scope.rateTypeReadOnly = false;
                $scope.hideLineItemRate = false;
                $scope.pricingRate = '';
                $scope.hideAdGroupName = false;
                if(CONST_COGS_PERCENT === $scope.lineItemType.name){
                    if(selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)){
                        $scope.rateReadOnly = true;
                        $scope.pricingRate = selectedAdvertiser.billingValue + "% Markup";// to get via advertiser api
                        //$scope.rateTypeReadOnly = true;

                       // manully setting parameter in type dropdown
                        var arr = [];
                        var index = _.findIndex($scope.type,function(item){
                            return item.name === $scope.lineItemType.name;
                        });
                        arr.push($scope.type[index]);
                        var index1 = _.findIndex($scope.type,function(item){
                            return item.name === CONST_FLAT_FEE;
                        })
                        arr.push($scope.type[index1]);
                        $scope.type = arr;

                    }
                    console.log("$scope.type",$scope.type)
                    $scope.volumeFlag = false;
                    $scope.volume = '';
                }
                else if(CONST_COGS_CPM === $scope.lineItemType.name){
                    if(selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)){
                        $scope.rateReadOnly = true;
                        $scope.pricingRate = selectedAdvertiser.billingValue;// to get via advertiser api
                        //$scope.rateTypeReadOnly = true;
                        // manully setting parameter in type dropdown
                        var arr = [];
                        var index = _.findIndex($scope.type,function(item){
                            return item.name === $scope.lineItemType.name
                        });
                        arr.push($scope.type[index]);
                        var index1 = _.findIndex($scope.type,function(item){
                            return item.name === CONST_FLAT_FEE
                        })
                        arr.push($scope.type[index1]);
                        $scope.type = arr;
                    }
                    $scope.volumeFlag = false;
                    $scope.volume = '';
                }
                else if (CONST_FLAT_FEE === $scope.lineItemType.name){
                    if(selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)){
                        $scope.rateReadOnly = true;
                        $scope.pricingRate = selectedAdvertiser.billingValue;// to get via advertiser api
                        //$scope.rateTypeReadOnly = true;
                        //var arr = [];
                        //var index = _.findIndex($scope.type,function(item){
                        //    return item.name === $scope.lineItemType.name
                        //});
                        //arr.push($scope.type[index]);
                        //var index1 = _.findIndex($scope.type,function(item){
                        //    return item.name === CONST_FLAT_FEE
                        //})
                        //arr.push($scope.type[index1]);
                        //$scope.type = arr;

                    }
                    $scope.hideAdGroupName = true;
                    $scope.hideLineItemRate = true;
                    $scope.pricingRate = '0';

                    $scope.volumeFlag = false;
                    $scope.volume = '';
                    //$scope.amountFlag = false;
                    $scope.billableAmount = '';
                }
            } else {
                $scope.rateReadOnlyEdit = false;
                $scope.billableAmount = '';
                $scope.volumeFlagEdit = true;
                $scope.amountFlagEdit = true;
                $scope.hideLineItemRateEdit = false;
                $scope.hideAdGroupNameEdit = false;
                //$scope.editLineItem.pricingRate = (obj.pricingRate)?obj.pricingRate:'';

                if(CONST_COGS_PERCENT === $scope.editLineItem.lineItemType.name){

                    if(selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)){
                        $scope.rateReadOnlyEdit = true;
                        $scope.editLineItem.pricingRate = selectedAdvertiser.billingValue;// to get via advertiser api
                        $scope.rateTypeReadOnlyEdit = true;
                    }
                    $scope.volumeFlagEdit = false;
                    $scope.editLineItem.volume = '';

                }
                else if(CONST_COGS_CPM === $scope.editLineItem.lineItemType.name){
                    if(selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)){
                        $scope.rateReadOnlyEdit = true;
                        $scope.editLineItem.pricingRate = selectedAdvertiser.billingValue;// to get via advertiser api
                        $scope.rateTypeReadOnlyEdit = true;
                    }
                    $scope.volumeFlagEdit = false;
                    $scope.editLineItem.volume = '';

                }
                else if (CONST_FLAT_FEE === $scope.editLineItem.lineItemType.name){
                    if(selectedAdvertiser && (selectedAdvertiser.billingType && selectedAdvertiser.billingValue)){
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
                    //$scope.amountFlagEdit = false;
                    //$scope.editLineItem.billableAmount = '';
                }
            }
        };


        $scope.$parent.resetLineItemParameters = function(){
            $scope.lineItemName = '';
            $scope.lineItemType = {};
            $scope.lineItemType.name = 'Select Type';
            $scope.lineItemType.id = '';
            $('.lineItemType').html('<span class="text" data-ng-bind="lineItemType.name">Select Type</span> <span class="icon-arrow-down"></span>');
            $scope.volume = '';
            $scope.billableAmount = '';
            $scope.pricingRate = '';
            $scope.adGroupName = '';
            $scope.lineTarget = '';
            $scope.createItemList = false;

            $scope.rateReadOnly = false;
            $scope.volumeFlag = true;
            $scope.amountFlag = true;
            $scope.hideAdGroupName = false;
            $scope.hideCOGS = false;
            $scope.type = angular.copy(workflowService.getRateTypes());
        }


        //Line Item Table Row Edit
        $scope.showEditItemRow = function(event,lineItem) {
            oldLineItem = angular.copy(lineItem);
            $(".tr .tableNormal").show();
            $(".tr .tableEdit").hide();

            var target =  event.currentTarget;
            $(target).toggle();
            $(target).closest('.tr').find('.tableEdit').toggle();

            console.log(lineItem);
            //populate edit lineitem fields
            populateLineItemEdit(lineItem);

        };

        $scope.updateLineItem = function(newItem){
            $scope.deleteLineItem(false);
            $scope.createNewLineItem('edit');
            //$scope.lineItemList.push(index,1);

        }

        $scope.deleteLineItem = function(deleteFlag){
            var index = _.findIndex($scope.lineItemList,function(item){
                if(item.name === oldLineItem.name && item.billingTypeId === oldLineItem.billingTypeId && item.pricingRate === oldLineItem.pricingRate){
                    return true;
                }
            });
            if(deleteFlag == true){
                $scope.lineItemBillableAmountTotal -= Number($scope.lineItemList[index]['billableAmount']);
            }
            $scope.lineItemList.splice(index,1);
        }

        //populate line item in case of edit and cancel of edit
        function populateLineItemEdit(lineItem) {
            $scope.editLineItem.lineItemName = lineItem.name;
            $scope.editLineItem.lineItemType = lineItem.lineItemType;
            $scope.editLineItem.pricingRate = lineItem.pricingRate;
            $scope.editLineItem.billableAmount = lineItem.billableAmount;
            $scope.editLineItem.volume = lineItem.volume;
            $scope.editLineItem.startTime = lineItem.startTime;
            $scope.editLineItem.endTime = lineItem.endTime;
            if(lineItem.adGroupName){
                $scope.editLineItem.adGroupName = lineItem.adGroupName;
            }
            $scope.setLineItem($scope.editLineItem.lineItemType,'edit');
        }

        $scope.$watch('selectedCampaign.endTime',function(){
            $scope.initiateLineItemDatePicker();
        });

        $scope.$watch('selectedCampaign.startTime',function(){
            $scope.initiateLineItemDatePicker();
        });

        // ******** Line item edit mode ******
        $scope.$parent.processLineItemEditMode = function(lineItemList){
            _.each(lineItemList,function(item){
                item.startTime = momentService.utcToLocalTime(item.startTime);
                item.endTime = momentService.utcToLocalTime(item.endTime);
                console.log('processLineItemEditMode',item);
                $scope.lineItemName = item.name;
                var index = _.findIndex($scope.type,function(type){
                    return type.id === item.billingTypeId;
                });
                $scope.setLineItem($scope.type[index],'create');
                $scope.hideAdGroupNameEdit = true;
                $scope.lineItemType.id = item.billingTypeId;
                $scope.billableAmount = item.billableAmount;
                $scope.volume = item.volume;
                $scope.pricingRate = item.billingRate;
                $scope.lineItemStartDate = momentService.utcToLocalTime(item.startTime);
                $scope.lineItemEndDate = momentService.utcToLocalTime(item.endTime)
                campaignId = item.campaignId;
                $scope.createNewLineItem('create');

            })


        }
    });
});