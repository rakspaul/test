var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CreateCampaignController', function ($scope,$rootScope, $window, $routeParams, $locale, $timeout, $location, constants, workflowService, utils, loginModel) {
        $scope.archiveCampaign=function(event){
            var campaignArchiveErrorHandler=function(){
               $rootScope.setErrAlertMessage();
            }
            workflowService.deleteCampaign($scope.campaignId).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.campaignArchive=false;
                    var url = '/campaigns';
                        if($scope.editCampaignData.adsCount >0 ) {
                            localStorage.setItem('topAlertMessage', $scope.editCampaignData.name+" and "+$scope.editCampaignData.adsCount+" has been archived");
                        } else {
                            localStorage.setItem('topAlertMessage', $scope.editCampaignData.name+" has been archived");
                        }
                        $location.url(url);
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
                    $scope.selectedCampaign.goal = $scope.editCampaignData.goal;
                    if($scope.editCampaignData.kpiType=="DELIVERY"){
                        $scope.editCampaignData.kpiType="Delivery";
                        $scope.hideKpiValue=true;
                    }
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
            Kpi:function(){
                $scope.workflowData['Kpi']=[{id:1, name: 'None'},{id:1, name: 'CPA'},{id:2, name: 'CPC'},{id:3, name: 'CPM'},{id:4, name: 'CTR'},{id:5, name: 'Delivery'},{id:6, name: 'VTC'}];
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

        $scope.saveCampaign = function () {
            console.log("campaign create saveCampaign...");
            $scope.$broadcast('show-errors-check-validity');
            console.log($scope.createCampaignForm)
            if ($scope.createCampaignForm.$valid) {
                var formElem = $("#createCampaignForm");
                var formData = formElem.serializeArray();
                formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
                var postDataObj = {};
                createCampaign.getBrandId(formData.brandId, postDataObj);
                postDataObj.goal = formData.goal
                postDataObj.bookedRevenue = Number(formData.budget);
                postDataObj.name = formData.campaignName;
                if(formData.kpiType!="None"){
                    postDataObj.kpiType = (formData.kpiType).toUpperCase();
                    postDataObj.kpiValue = formData.kpiValue;
                }

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

        $(function () {
            $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
            $("html").css('background','#fff');
            $scope.locale = $locale;
            // This sets dynamic width to line to take 100% height
            function colResize() {
                var winHeight = $(window).height() - 50;
                $("#campaignCreate .settingWrap").css('height', winHeight + 'px');
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
            $scope.archiveMessage= $scope.textConstants.CAMPAIGN_ARCHIVE_MESSAGES;
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
            if ($scope.mode == 'edit') {
                $scope.processEditCampaignData();
            } else {
                $scope.initiateDatePicker();
                createCampaign.fetchGoals();
            }
        })
    });
})();
