var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CreateCampaignController', function ($scope,$rootScope, $window, $routeParams, $locale, $timeout, $location, constants, workflowService, utils, loginModel) {
        $scope.selectedKeywords = [];
        $scope.platformKeywords=[];
        $scope.dropdownCss = {display:'none','max-height': '100px',overflow: 'scroll',top: '60px',
            left: '0px'};
        $scope.keywordText = "";
        $scope.Campaign = {
            kpiArr: [],
            costArr: []

        };
        $scope.platFormArr=[];
        $scope.selectedChannel="DISPLAY";
        $scope.Campaign.marginPercent=0;
        $scope.isPrimarySelected=true;
        $scope.costRowSum=0;
        $scope.workflowData = {};
        $scope.vendorRateData = [];

        $scope.selectedKpi = function(index,kpi) {
            $scope.Campaign.kpiArr[index]['kpiId']=kpi.id;
            $scope.Campaign.kpiArr[index]['kpiType']=kpi.name;

                    var impression=_.filter($scope.Campaign.kpiArr, function(obj) { return (obj.kpiType === "Impressions" ||obj.kpiType === "Viewable Impressions")});
                    if(impression.length>0){
                        $scope.workflowData['calculation'][0].active=true;
                    }else{
                        $scope.workflowData['calculation'][0].active=false;
                    }
                    var clicks=_.filter($scope.Campaign.kpiArr, function(obj) { return obj.kpiType === "Clicks"});
                    if(clicks.length>0){
                        $scope.workflowData['calculation'][1].active=true;
                    }else{
                        $scope.workflowData['calculation'][1].active=false;
                    }
                    var actions=_.filter($scope.Campaign.kpiArr, function(obj) { return obj.kpiType === "Actions"});
                    if(actions.length>0){
                        $scope.workflowData['calculation'][2].active=true;
                    }else{
                        $scope.workflowData['calculation'][2].active=false;
                    }
        }
        $scope.selectedVendor=function(index,vendor){
            $scope.Campaign.kpiArr[index]['vendorId']=vendor.id;
            $scope.Campaign.kpiArr[index]['vendorName']=vendor.name;
        }
        $scope.primaryKpiSelected=function(event,index,isSet){
            var target = $(event.target);
            target.parent().siblings().removeClass('active');
            target.parent().addClass('active');
            if(isSet){
                $scope.PrimaryImpressions=$scope.Campaign.kpiArr[index].kpiValue;
                for(var i in $scope.Campaign.kpiArr){
                    console.log($scope.Campaign.kpiArr[i].isPrimary);
                    if($scope.Campaign.kpiArr[i].isPrimary){
                        $scope.Campaign.kpiArr[i].isPrimary=false;
                    }
                }
            }
            $scope.Campaign.kpiArr[index]['isPrimary']=isSet;
        }
        $scope.kpiBilling=function(event,index,isSet){
            var target = $(event.target);
            target.parent().siblings().removeClass('active');
            target.parent().addClass('active');
            $scope.Campaign.kpiArr[index]['isBillable']=isSet;
            console.log(index);
        }
        $scope.selectedCostCategory=function(index,costObj){
            $scope.Campaign.costArr[index]['costCategoryId']=costObj.id;
            $scope.Campaign.costArr[index]['costCategoryName']=costObj.name;
            //make a call to vendorRate API with the ID
            createCampaign.vendorRate(costObj.id,index);
        }
        $scope.selectedCalculation=function(index,calObj){
            $scope.Campaign.costArr[index]['rateTypeId']=calObj.id;
            $scope.Campaign.costArr[index]['rateTypeName']=calObj.name;
            /*set model for rateValue*/
           // console.log($scope.vendorRateData[index]['vendors']);
            if($scope.vendorRateData[index] && ($scope.Campaign.costArr[index]['vendorId'])){
                    console.log("vendorID:",$scope.Campaign.costArr[index]['vendorId']);
                    var selectedVendorIndex=_.filter($scope.vendorRateData[index], function(obj) { return obj.id === Number($scope.Campaign.costArr[index]['vendorId'])});
//                    var selectedVendorIndex=_.filter($scope.vendorRateData[index]['vendors'], function(obj) { return obj.id === Number($scope.Campaign.costArr[index]['vendorId'])});
                    console.log(selectedVendorIndex);
                    console.log($scope.Campaign.costArr[index]['rateTypeName']);
                if($scope.Campaign.costArr[index]['rateTypeName']==="fixed"){
                    var rateObj=_.filter(selectedVendorIndex[0].rates, function(obj) { return obj.rate_type === "FIXED"});
                    $scope.Campaign.costArr[index]['rateValue']=rateObj[0].rate_val;
                }else if($scope.Campaign.costArr[index]['rateTypeName']==="CPM"){
                    var rateObj=_.filter(selectedVendorIndex[0].rates, function(obj) { return obj.rate_type === "CPM"});
                    $scope.Campaign.costArr[index]['rateValue']=rateObj[0].rate_val;
                }else if($scope.Campaign.costArr[index]['rateTypeName']==="CPC"){
                    var rateObj=_.filter(selectedVendorIndex[0].rates, function(obj) { return obj.rate_type === "CPC"});
                    $scope.Campaign.costArr[index]['rateValue']=rateObj[0].rate_val;
                }else if($scope.Campaign.costArr[index]['rateTypeName']==="CPA"){
                    var rateObj=_.filter(selectedVendorIndex[0].rates, function(obj) { return obj.rate_type === "CPA"});
                    $scope.Campaign.costArr[index]['rateValue']=rateObj[0].rate_val;
                }
            }
        }
        $scope.rateTypeSelected=function(event,index,isSet){
            var target = $(event.target);
            target.parent().siblings().removeClass('active');
            target.parent().addClass('active');
            $scope.Campaign.costArr[index]['type']=isSet;
            if(isSet=='fixed'){
                $scope.Campaign.costArr[index]['rateTypeName']="Select";
                $scope.Campaign.costArr[index]['rateTypeId']=5;
                var selectedVendorIndex=_.filter($scope.vendorRateData[index], function(obj) { return obj.id === Number($scope.Campaign.costArr[index]['vendorId'])});
//                var selectedVendorIndex=_.filter($scope.vendorRateData[index]['vendors'], function(obj) { return obj.id === Number($scope.Campaign.costArr[index]['vendorId'])});
                    var rateObj=_.filter(selectedVendorIndex[0].rates, function(obj) { return obj.rate_type === "FIXED"});
                    $scope.Campaign.costArr[index]['rateValue']=rateObj[0].rate_val;
                }
            console.log(index);
        }
        $scope.selectedVendorRate=function(index,vendorObj){
            $scope.Campaign.costArr[index]['vendorId']=vendorObj.id;
            $scope.Campaign.costArr[index]['vendorName']=vendorObj.name;
            if($scope.Campaign.costArr[index]['type']==="fixed"){
                var rateObj=_.filter(vendorObj.rates, function(obj) { return obj.rate_type === "FIXED"});
                $scope.Campaign.costArr[index]['rateValue']=rateObj[0].rate_val;
            }else if($scope.Campaign.costArr[index]['rateTypeName']==="CPM"){
                var rateObj=_.filter(vendorObj.rates, function(obj) { return obj.rate_type === "CPM"});
                $scope.Campaign.costArr[index]['rateValue']=rateObj[0].rate_val;
            }else if($scope.Campaign.costArr[index]['rateTypeName']==="CPC"){
                var rateObj=_.filter(vendorObj.rates, function(obj) { return obj.rate_type === "CPC"});
                $scope.Campaign.costArr[index]['rateValue']=rateObj[0].rate_val;
            }else if($scope.Campaign.costArr[index]['rateTypeName']==="CPA"){
                var rateObj=_.filter(vendorObj.rates, function(obj) { return obj.rate_type === "CPA"});
                $scope.Campaign.costArr[index]['rateValue']=rateObj[0].rate_val;
            }
        }
        $scope.ComputeCost=function(){
           // $scope.Campaign.nonInventoryCost=parseInt($scope.Campaign.totalBudget)*((100-parseInt($scope.Campaign.marginPercent))/100);
            $scope.costRowSum=0;
            if($scope.Campaign.costArr.length>0 && $scope.Campaign.kpiArr.length>0){
                    for(var i=0;i<$scope.Campaign.costArr.length;i++){
                        if($scope.Campaign.costArr[i].rateTypeId){
                            var targetValue=[];
                            if($scope.Campaign.costArr[i].rateTypeId==1) {
                                targetValue = _.filter($scope.Campaign.kpiArr, function (obj) {
                                    return (obj.kpiType === "Impressions") || (obj.kpiType === "Viewable Impressions")
                                });
                                $scope.calculateRowSum(i, targetValue,'CPM');
                            }
                            else if($scope.Campaign.costArr[i].rateTypeId==2){
                                targetValue=_.filter($scope.Campaign.kpiArr, function(obj) { return obj.kpiType === "Clicks"});
                                $scope.calculateRowSum(i,targetValue,'CPC');
                            }
                            else if($scope.Campaign.costArr[i].rateTypeId==3){
                                targetValue=_.filter($scope.Campaign.kpiArr, function(obj) { return obj.kpiType === "Actions"});
                                $scope.calculateRowSum(i,targetValue,'CPA');
                            }
                        }

                    }
                //console.log($scope.costRowSum);
                $scope.Campaign.nonInventoryCost=Math.round($scope.costRowSum * 100) / 100//$scope.costRowSum;
                $scope.Campaign.deliveryBudget= Math.round(parseFloat($scope.Campaign.totalBudget)*(100-parseFloat($scope.Campaign.marginPercent)) - $scope.Campaign.nonInventoryCost)/100;
                $scope.Campaign.effectiveCPM=Math.round($scope.calculateEffective())/100;

            }
        }
        $scope.calculateRowSum=function(index,kpiTargetArr,type){
            if($scope.Campaign.costArr[index].rateValue && $scope.Campaign.costArr[index].targetPercentage){
                var rowsummation= parseFloat($scope.Campaign.costArr[index].rateValue)*(parseFloat($scope.Campaign.costArr[index].targetPercentage)/100)*parseFloat(kpiTargetArr[0].kpiValue);
                if(type==="CPM"){
                    $scope.Campaign.costArr[index].rowSum=(rowsummation)/1000;
                }else{
                    $scope.Campaign.costArr[index].rowSum=rowsummation;
                }
                $scope.costRowSum += $scope.Campaign.costArr[index].rowSum;

            }
        }
        $scope.calculateEffective=function(){
            for(var ind=0;ind<$scope.Campaign.kpiArr.length;ind++){
                if($scope.Campaign.kpiArr[ind].isPrimary || $scope.Campaign.kpiArr[ind].isPrimary=="true"){
                    if($scope.Campaign.kpiArr[ind].kpiType=="Impressions" || $scope.Campaign.kpiArr[ind].kpiType=="Viewable Impressions")
                        return parseFloat($scope.Campaign.deliveryBudget) / parseFloat($scope.Campaign.kpiArr[ind].kpiValue)*1000;
                    else
                        return parseFloat($scope.Campaign.deliveryBudget) / parseFloat($scope.Campaign.kpiArr[ind].kpiValue);
                }
            }
        }
        $scope.checkedObjectiveList=[];
        $scope.addMoreKpi=function(){
            $scope.Campaign.kpiArr.push({kpiType: '', kpiId:'', isPrimary: false ,vendorId:'',vendorName:'',kpiValue:0, isBillable:true});
        }
        $scope.addMoreCost=function(){
            $scope.Campaign.costArr.push({costCategoryId: '',costCategoryName:'', type: 'variable', rateTypeId:'',rateTypeName:'',vendorId:'',vendorName:'', rateValue:'', targetPercentage:100, description:''});
        }
        $scope.msgtimeoutReset = function(){
            $timeout(function(){
                $scope.resetFlashMessage() ;
            }, 3000);
        }
        $scope.triggerBudgetClick = function(){
            console.log("triggerEVENt")
            angular.element('.budget-page-trigger').trigger('click');
        }

        $scope.archiveCampaign=function(event){
            var campaignArchiveErrorHandler=function(){
               $rootScope.setErrAlertMessage();
            }
            workflowService.deleteCampaign($scope.campaignId).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.campaignArchive=false;
                    var url = '/mediaplans';
                        if($scope.editCampaignData.adsCount >0 ) {
                            localStorage.setItem('topAlertMessage', $scope.editCampaignData.name+" and "+$scope.editCampaignData.adsCount+" has been archived");
                        } else {
                            localStorage.setItem('topAlertMessage', $scope.editCampaignData.name+" has been archived");
                        }
                        window.location.href = url;
                }else{
                    campaignArchiveErrorHandler();
                }
            },campaignArchiveErrorHandler);
        }
        $scope.cancelArchiveCampaign=function(){
            $scope.campaignArchive=!$scope.campaignArchive;
        }

        $scope.numbersOnly = function(scopeVar){
          if(scopeVar === 'budgetAmount' && $scope.mode != "edit" && $scope.selectedCampaign.budget != undefined)
                $scope.selectedCampaign.budget = $scope.selectedCampaign.budget.replace($scope.numberOnlyPattern, '');

        }
        $scope.channelSelected=function(event,channel){
            var target = $(event.target);
            target.parent().siblings().removeClass('active');
            target.parent().addClass('active');
            $scope.selectedChannel=channel;
        }
        $scope.selectedObjective=function(objectiveObj){
           // console.log(objectiveObj);
            var index = _.findIndex($scope.checkedObjectiveList, function(item) {
                return item.campaignObjectiveTypeId == objectiveObj.campaignObjectiveTypeId}); //console.log(index);
            if(index>=0){
                $scope.checkedObjectiveList.splice(index,1);
            }
            else{
                objectiveObj.isChecked=true;
                $scope.checkedObjectiveList.push(objectiveObj);
            }
            console.log($scope.checkedObjectiveList);
        }

        $scope.processEditCampaignData = function () {
            workflowService.getCampaignData($scope.campaignId).then(function (result) {
                console.log(result);
                if (result.status === "OK" || result.status === "success") {
                    $scope.editCampaignData = result.data.data;
                    $scope.selectedCampaign.clientId = $scope.editCampaignData.clientId;
                    $scope.selectedCampaign.advertiserId = $scope.editCampaignData.advertiserId;
                    $scope.selectedCampaign.startTime = utils.convertToEST($scope.editCampaignData.startTime,'MM/DD/YYYY');
                    $scope.selectedCampaign.endTime = utils.convertToEST($scope.editCampaignData.endTime,'MM/DD/YYYY');
                    $scope.editCampaignData.brandName = $scope.editCampaignData.brandName || 'Select Brand';
                    $scope.selectedCampaign.kpiValue= $scope.editCampaignData.kpiValue;
                    //$scope.selectedCampaign.goal = $scope.editCampaignData.goal;
//                    if($scope.editCampaignData.kpiType=="DELIVERY"){
//                        $scope.editCampaignData.kpiType="Delivery";
//                        $scope.hideKpiValue=true;
//                    }
                    $scope.initiateDatePicker();
                    createCampaign.fetchGoals();
                    $scope.mode ==='edit' &&  createCampaign.fetchBrands($scope.selectedCampaign.clientId,$scope.selectedCampaign.advertiserId);
                }
            });
        }


        $scope.getGoalIconName = function (goal) {
            var goalMapper = {'performance': 'performance', 'brand': 'brand'}
            return goalMapper[goal.toLowerCase()];
        }

        var createCampaign = {
            clients: function () {
                workflowService.getClients().then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['clients'] = _.sortBy(responseData, 'name');
                    }
                    else {
                        createCampaign.errorHandler(result);
                    }
                }, createCampaign.errorHandler);
            },
            objectives:function(){
                workflowService.getObjectives({cache: false}).then(function (result) {
                       if (result.status === "OK" || result.status === "success") {
                         var responseData = result.data.data;
                    var branding=_.filter(responseData,function(obj){return obj.objective==="Branding"});
                    $scope.workflowData['branding']=branding[0].subObjectives;
                    var performance=_.filter(responseData,function(obj){return obj.objective==="Performance"})
                    $scope.workflowData['performance']=performance[0].subObjectives;
                    }
                })
                // $scope.workflowData['branding']=[{id:1,name:'Awareness',isChecked:false},{id:2,name:'Recall',isChecked:false},{id:3,name:'Purchase Intent',isChecked:false},{id:4,name:'Incremental Reach',isChecked:false},{id:5,name:'Tune-In',isChecked:false},{id:6,name:'Consideration',isChecked:false},{id:7,name:'Favorability',isChecked:false}]
                // $scope.workflowData['performance']=[{id:8,name:'Clicks',isChecked:false},{id:9,name:'Video Completion',isChecked:false},{id:10,name:'Lead Generation',isChecked:false},{id:11,name:'Conversions',isChecked:false},{id:5,name:'Site Traffic',isChecked:false},{id:12,name:'Audience Verification',isChecked:false},{id:13,name:'Viewability',isChecked:false}]
            },
            Kpi:function(){
                $scope.workflowData['Kpi']=[{id:1, name: 'Impressions',active:true},{id:1, name: 'Clicks',active:true},{id:2, name: 'Viewable Impressions',active:true},{id:3, name: 'Actions',active:false}];
            },
            vendor:function(costCategoryId){
                workflowService.getVendors(costCategoryId,{cache: false}).then(function (result) {console.log(result);
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['vendor']=responseData;

                        // $scope.workflowData['branding']=[{id:1,name:'Awareness',isChecked:false},{id:2,name:'Recall',isChecked:false},{id:3,name:'Purchase Intent',isChecked:false},{id:4,name:'Incremental Reach',isChecked:false},{id:5,name:'Tune-In',isChecked:false},{id:6,name:'Consideration',isChecked:false},{id:7,name:'Favorability',isChecked:false}]
                        // $scope.workflowData['performance']=[{id:8,name:'Clicks',isChecked:false},{id:9,name:'Video Completion',isChecked:false},{id:10,name:'Lead Generation',isChecked:false},{id:11,name:'Conversions',isChecked:false},{id:5,name:'Site Traffic',isChecked:false},{id:12,name:'Audience Verification',isChecked:false},{id:13,name:'Viewability',isChecked:false}]
                    }
                })

               // $scope.workflowData['vendor']=[{id:1, name: 'Adometry'},{id:1, name: 'DFP'},{id:2, name: 'Collective Media'},{id:3, name: 'Double Verify'}];
            },
            platforms:function(){
                $scope.Campaign.kpiArr.push({kpiType: '', kpiId:'', isPrimary: false ,vendorId:'',vendorName:'',kpiValue:0, isBillable:true});
                $scope.Campaign.costArr.push({costCategoryId: '',costCategoryName:'', type: 'variable', rateTypeId:'',vendorId:'',vendorName:'', rateValue:'', targetPercentage:100, description:''});
                workflowService.getPlatforms({cache: false}).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.platformKeywords=responseData.fullIntegrationsPlatforms;
                    }
                })

            },
            costCategories:function(){
                workflowService.getCostCategories({cache: false}).then(function (result) {console.log(result);
                   if (result.status === "OK" || result.status === "success") {
                     var responseData = result.data.data;
                       $scope.workflowData['costCategory']=responseData;console.log("responseData[responseData.length-1].id",responseData[responseData.length-1].id)
                       createCampaign.vendor(responseData[responseData.length-1].id);
                }
                })
               // $scope.workflowData['costCategory']=[{id:0, name: 'Attribution'},{id:1, name: 'Ad Serving'},{id:2, name: 'Research'},{id:3, name: 'Verification'}];

            },
            calculation:function(){
                $scope.workflowData['calculation']=[{id:1, name: 'CPM',type:'Impressions',active:false},{id:2, name: 'CPC', type:"Clicks", active:false},{id:3, name: 'CPA',type:'Actions',active:false},{id:5, name: 'CPV',type:'Actions',active:false}];
            },
            vendorRate:function(categoryId,index){ //console.log(index);
                var clientId=JSON.parse(localStorage.selectedClient).id;
                workflowService.getVendorForSelectedCostCategory(clientId,categoryId,{cache: false}).then(function (result) {
                   if (result.status === "OK" || result.status === "success") {
                     var responseData = result.data.data;
                       console.log(responseData);
                       $scope.vendorRateData[index]=responseData;
                }
                })
            },
            fetchAdvertisers: function (clientId) {
                workflowService.getAdvertisers(clientId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['advertisers'] = _.sortBy(responseData, 'name');
                    }
                    else {
                        createCampaign.errorHandler(result);
                    }
                }, createCampaign.errorHandler);
            },

            fetchBrands: function (clientId, advertiserId) {
                workflowService.getBrands(clientId,advertiserId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['brands'] = _.sortBy(responseData, 'name');
                    }
                    else {
                        createCampaign.errorHandler(result);
                    }
                }, createCampaign.errorHandler);
            },

            fetchGoals: function () {
                var goals = $scope.workflowData['goals'] = [{id: 1, name: 'Performance', 'active': true}, {id: 2,name: 'Brand','active': false}];
                if ($scope.mode == 'edit') {
                    _.each(goals, function (goal) {
                        if (goal.name.toLowerCase() == $scope.editCampaignData.goal.toLowerCase()) {
                            goal['active'] = true;
                            $scope.selectedCampaign.goal = goal;
                        } else {
                            goal['active'] = false;
                        }
                    })
                } else {
                    $scope.selectedCampaign.goal =$scope.workflowData['goals'][0];
                }
            },

            errorHandler: function (errData) {
                console.log(errData);
            }
        }

        $scope.selectHandler = function (type, data, event) {
            switch (type) {
                case 'client' :
                    $scope.workflowData['advertisers'] = {};
                    $scope.workflowData['brands'] = {};
                    $scope.selectedCampaign.advertiser = '';
                    $("#advertiserDDL").parents('.dropdown').find('button').html("Select Advertiser<span class='icon-arrow-down'></span>");
                    $("#brandDDL").parents('.dropdown').find('button').html("Select Brand<span class='icon-arrow-down'>");
                    $scope.selectedCampaign.clientId = data.id;
                    createCampaign.fetchAdvertisers(data.id);
                    break;
                case 'advertiser' :
                    $scope.workflowData['brands'] = {};
                    $scope.selectedCampaign.brand = '';
                    $scope.selectedCampaign.advertiserId = data.id;
                    $("#brandDDL").parents('.dropdown').find('button').html("Select Brand <span class='icon-arrow-down'></span>");
                    createCampaign.fetchBrands($scope.selectedCampaign.clientId,data.id);
                    break;
                case 'brand' :
                    $scope.selectedCampaign.brandId = data.id;
                    break;
            }
        }
        $scope.kpiSelected=function(kpi){
            $scope.selectedCampaign.kpi = kpi.name;
            if(kpi.name=='Delivery'||kpi.name=='None'){
                $scope.selectedCampaign.kpiValue=0;
                $scope.hideKpiValue=true;
            }else{
                $scope.selectedCampaign.kpiValue='';
                $scope.hideKpiValue=false;
            }
        }

        $scope.handleFlightDate = function (data) {
            var startTime = data.startTime;
            var endTime = data.endTime;
            var endDateElem = $('#endDateInput')
            var changeDate;
            if ($scope.mode !== 'edit') {
                endDateElem.attr("disabled", "disabled").css({'background': '#eee'});
                if (startTime) {
                    endDateElem.removeAttr("disabled").css({'background': 'transparent'});
                    changeDate = moment(startTime).format('MM/DD/YYYY'); //console.log(moment(startTime).tz("EST").format('YYYY-MM-DD HH:mm:ss.SSS'));
                    endDateElem.datepicker("setStartDate", changeDate);
                    endDateElem.datepicker("update", changeDate);
                }
            } else {
              endDateElem.removeAttr("disabled").css({'background': 'transparent'});
              endDateElem.datepicker("setStartDate", endTime);
              endDateElem.datepicker("update", endTime);
            }
            if(moment(startTime).isAfter(endTime, 'day')) {
              endDateElem.datepicker("update", startTime);
            }
        }

        $scope.sucessHandler = function (result) {
            var url = '/mediaplan/' + result.data.data.id + '/overview';
            $location.url(url);
        }

        $scope.selectCampaignGoal = function (goal) {

            console.log("goal", goal);
            var goalData = $scope.workflowData['goals'];
            _.each(goalData, function (obj) {
                if(obj.name === goal) {
                    $scope.selectedCampaign.goal = obj;
                    obj.active = true
                } else {
                    obj.active = false;
                }
            })



        };

        createCampaign.getBrandId = function (brandId, postDataObj) {
            brandId = Number(brandId);
            if (brandId > 0) {
                postDataObj.brandId = brandId;
            }
        };
        $scope.checkIfPrimaryKpiSelected=function(){
            var kpiObj= _.filter($scope.Campaign.kpiArr,function(obj){ return obj.isPrimary==true ||obj.isPrimary=='true'});
            if(kpiObj.length<=0){
                return false;
            }else{
                return true;
            }
        }

        $scope.saveCampaign = function () {
            console.log("campaign create saveCampaign...");
            $scope.$broadcast('show-errors-check-validity');
            console.log($scope.createCampaignForm)
            var isPrimarySelected=$scope.checkIfPrimaryKpiSelected();
            $scope.isPrimarySelected=isPrimarySelected;
            if ($scope.createCampaignForm.$valid && isPrimarySelected) {
                var formElem = $("#createCampaignForm");
                var formData = formElem.serializeArray();
                formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
                var postDataObj = {};
                createCampaign.getBrandId(formData.brandId, postDataObj);
               // postDataObj.goal = formData.goal
                postDataObj.bookedRevenue = Number(formData.budget);
                postDataObj.name = formData.campaignName;
                postDataObj.campaignType=$scope.selectedChannel;
                postDataObj.totalBudget=$scope.Campaign.totalBudget;
                postDataObj.marginPercent=$scope.Campaign.marginPercent;
                postDataObj.campaignKpis=$scope.Campaign.kpiArr;
                postDataObj.campaignCosts=$scope.Campaign.costArr;
                postDataObj.campaignObjectives=$scope.checkedObjectiveList;
                postDataObj.preferredPlatforms=$scope.platFormArr;
//                if(formData.kpiType!="None"){
//                    postDataObj.kpiType = (formData.kpiType).toUpperCase();
//                    postDataObj.kpiValue = formData.kpiValue;
//                }

                postDataObj.clientId =  loginModel.getSelectedClient().id;
                if ($scope.mode == 'edit') {
                    if (moment(formData.startTime).format('YYYY-MM-DD') === utils.convertToEST($scope.editCampaignData.startTime,'YYYY-MM-DD'))
                        postDataObj.startTime = $scope.editCampaignData.startTime;
                    else
                        postDataObj.startTime = utils.convertToUTC(formData.startTime,'ST');//the formtime hardcoded to 23:59:59:999
                    if (moment(formData.endTime).format('YYYY-MM-DD') === utils.convertToEST($scope.editCampaignData.endTime,'YYYY-MM-DD'))
                        postDataObj.endTime = $scope.editCampaignData.endTime;
                    else
                        postDataObj.endTime = utils.convertToUTC(formData.endTime,'ET');


                    postDataObj.advertiserId = $scope.editCampaignData.advertiserId;
                    postDataObj.updatedAt = $scope.editCampaignData.updatedAt;
                    postDataObj.campaignId = $routeParams.campaignId;
                    $scope.repushCampaignEdit = true;
                    $scope.repushData = postDataObj; console.log($scope.repushData);
                } else {
                    postDataObj.startTime = utils.convertToUTC(formData.startTime,'ST');//console.log(postDataObj.startTime)
                    postDataObj.endTime = utils.convertToUTC(formData.endTime,'ET');//console.log(postDataObj.endTime)
                    postDataObj.advertiserId = Number(formData.advertiserId);console.log(postDataObj);
                    workflowService.saveCampaign(postDataObj).then(function (result) {
                        if (result.status === "OK" || result.status === "success") {
                            $scope.sucessHandler(result);
                            localStorage.setItem('topAlertMessage', $scope.textConstants.CAMPAIGN_CREATED_SUCCESS);
                        }
                    });
                }
            }
        };
        $scope.repushCampaign = function () {
            $scope.repushCampaignEdit = false;
            workflowService.updateCampaign($scope.repushData, $routeParams.campaignId).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.sucessHandler(result);
                    localStorage.setItem('topAlertMessage', $scope.textConstants.CAMPAIGN_UPDATED_SUCCESS);
                    localStorage.setItem('campaignData', '');
                    $scope.repushCampaignEdit = false;
                } else {
                    console.log(result);
                }
            });

        }
        $scope.cancelRepushCampaign = function () {
            $scope.repushCampaignEdit = false;
            localStorage.setItem('campaignData', '');
        }
        $scope.reset = function () {
            $scope.$broadcast('show-errors-reset');
            $scope.selectedCampaign = {};
        };

        $scope.resetFlashMessage = function(){
            $rootScope.setErrAlertMessage('',0);
        }

        $scope.getRandom = function () {
            return Math.floor((Math.random() * 6) + 1);
        },

        $scope.initiateDatePicker = function () {
            if ($scope.mode == 'edit') {
                var startDateElem = $('#startDateInput');
                var endDateElem = $('#endDateInput');
                var today = new Date();
                var campaignStartTime = utils.convertToEST($scope.editCampaignData.startTime,'MM/DD/YYYY');
                var campaignEndTime = utils.convertToEST($scope.editCampaignData.endTime,'MM/DD/YYYY');
                var currentDateTime = utils.convertToEST('','MM/DD/YYYY');
                if(moment(campaignStartTime).isAfter(currentDateTime)) {
                  startDateElem.datepicker("setStartDate", currentDateTime);
                  startDateElem.datepicker("update", campaignStartTime);
                  startDateElem.datepicker("setEndDate", campaignStartTime);
                } else {
                  startDateElem.datepicker("setStartDate", campaignStartTime);
                  startDateElem.datepicker("update", campaignStartTime);
                  startDateElem.datepicker("setEndDate", campaignStartTime);
                }
            } else {
                var startDateElem = $('#startDateInput');
                var endDateElem = $('#endDateInput');
                var today=utils.convertToEST('','MM/DD/YYYY');
                startDateElem.datepicker("setStartDate", today);
                endDateElem.datepicker("setStartDate", today);
                startDateElem.datepicker("update", today);
                $scope.selectedCampaign.startTime = today;
                $scope.selectedCampaign.endTime = today;
            }
        }
        $scope.showKeywords = function(keyword){
            if(keyword.length > 0)
                $scope.dropdownCss.display = 'block';
            else
                $scope.dropdownCss.display = 'none';

        }
        $scope.convertPreferredPlatformToArr=function(platformsObj){
            $scope.platFormArr=[];
            for(var i=0;i<platformsObj.length;i++){
                $scope.platFormArr.push(platformsObj[i].id);
            }
        }
        $scope.selectKeyword = function(keyword){
            $scope.dropdownCss.display = 'none';
            $scope.selectedKeywords.push(keyword);
            var index = _.findIndex($scope.platformKeywords, function(item) {
                return item.id == keyword.id});
            $scope.platformKeywords.splice(index,1);
            $('.keyword-txt').val('');
            $scope.convertPreferredPlatformToArr($scope.selectedKeywords);
        }

        $scope.removeKeyword = function(keyword){
            $scope.platformKeywords.push(keyword);
            var index = _.findIndex($scope.selectedKeywords, function(item) {
                return item.id == keyword.id});
            $scope.selectedKeywords.splice(index,1);
            $('.keyword-txt').val('');
        }

        $(function () {
            $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
            $("html").css('background','#fff');
            $scope.locale = $locale;
            // This sets dynamic width to line to take 100% height
            function colResize() {
                var winHeight = $(window).height() - 50;
                $("#campaignCreate .settingWrap").css('min-height', winHeight + 'px');
            }

            colResize();
            $(window).resize(function () {
                colResize();
            });

            // This is for the drop down list. Perhaps adding this to a more general controller
            $(document).on('click', '.dropdown-menu li.available a', function () {
                $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="icon-arrow-down"></span>');
                $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
            });
            $('.dropdown-workflow a').each(function () {
                var text = $(this).text()
                if (text.length > 14)
                    $(this).val(text).text(text.substr(0, 20) + '…')
            });
            $scope.textConstants = constants;
            $scope.workflowData = {};
            $scope.selectedCampaign = {};
            $scope.repushCampaignEdit = false;
            $scope.campaignId = $routeParams.campaignId;
            $scope.mode = workflowService.getMode();
            $scope.campaignArchive=false;
            $scope.deleteCampaignFailed=false;
            $scope.numberOnlyPattern = /[^0-9]/g;
            $scope.hideKpiValue=false;
            $scope.client =  loginModel.getSelectedClient();
            $scope.isClientDropDownDisable = false;
            if($scope.client.name) {
                $scope.isClientDropDownDisable = true;
                $scope.clientName = $scope.client.name;
                ($scope.mode == 'create')  && $scope.selectHandler('client', $scope.client, null);
            }

            $('.input-daterange').datepicker({
                //format: "mm/dd/yyyy",
                format: "mm/dd/yyyy",
                orientation: "auto",
                autoclose: true,
                todayHighlight: true
            });
            createCampaign.Kpi();
            createCampaign.platforms();
           // createCampaign.vendor();
            createCampaign.objectives();
            createCampaign.costCategories();
            createCampaign.calculation();
            if ($scope.mode == 'edit') {
                $scope.processEditCampaignData();
            } else {
                $scope.initiateDatePicker();
                createCampaign.fetchGoals();
            }
        })
    });
})();
