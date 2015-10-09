var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CreateCampaignController', function ($scope, $window, $routeParams, constants, workflowService,$timeout, $location) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
        // This sets dynamic width to line to take 100% height
        function colResize() {
            var winHeight = $(window).height() - 66;
            $("#campaignCreate .settingWrap").css('height', winHeight+'px');
        } colResize();
        $(window).resize(function(){ colResize(); });
        // This is for the drop down list. Perhaps adding this to a more general controller
        $(document).on('click','.dropdown-menu li a', function() {
            $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="icon-arrow-down"></span>');
            $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
        });
        $('.dropdown-workflow a').each(function(){
            var text=$(this).text()
            if (text.length>14)
            $(this).val(text).text(text.substr(0,20)+'…')
        });
        $scope.textConstants = constants;
        $scope.workflowData = {};
        $scope.selectedCampaign = {};
                if(localStorage.getItem('campaignData').length>0){
                $scope.editCampaignData=JSON.parse(localStorage.getItem('campaignData'));
                $scope.dataLength = $scope.editCampaignData.length > 0 ? false : true;
                console.log($scope.editCampaignData);
                console.log($scope.dataLength);
                }
                $scope.repushCampaignEdit=false;

        $scope.getGoalIconName = function (goal) {
            var goalMapper = {'performance': 'signal', 'brand': 'record'}
            return goalMapper[goal.toLowerCase()];
        }

        var createCampaign = {
            clients :  function() {

                workflowService.getClients().then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['clients'] =  _.sortBy(responseData, 'name');
                    }
                    else{
                        createCampaign.errorHandler(result);
                    }
                }, createCampaign.errorHandler);
            },

            fetchAdvertisers :  function(clientId) {
                workflowService.getAdvertisers(clientId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['advertisers'] =  _.sortBy(responseData, 'name');
                    }
                    else{
                        createCampaign.errorHandler(result);
                    }
                }, createCampaign.errorHandler);
            },

            fetchBrands : function(advertiserId) {
                workflowService.getBrands(advertiserId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['brands'] =  _.sortBy(responseData, 'name');
                    }
                    else{
                        createCampaign.errorHandler(result);
                    }
                }, createCampaign.errorHandler);
            },

            fetchGoals :  function() {
                      if($scope.dataLength)
                      {   if($scope.editCampaignData.goal=="BRAND")
                              $scope.workflowData['goals'] = [{id : 1, name : 'Performance', 'active' : false}, {id : 2, name : 'Brand', 'active' : true}]
                          else
                              $scope.workflowData['goals'] = [{id : 1, name : 'Performance', 'active' : true}, {id : 2, name : 'Brand', 'active' : false}]
                              $scope.selectedCampaign.goal =$scope.workflowData['goals'][0];

                      }else{
                          $scope.workflowData['goals'] = [{id : 1, name : 'Performance', 'active' : true}, {id : 2, name : 'Brand', 'active' : false}]
                          $scope.selectedCampaign.goal =$scope.workflowData['goals'][0];
                      }

                      },


            errorHandler : function(errData) {
                console.log(errData);
            }
        }


        $scope.selectHandler =  function(type, data) {
            switch(type) {
                case 'client' :
                    $scope.workflowData['advertisers'] = {};
                    $scope.workflowData['brands'] = {};
                    $scope.selectedCampaign.advertiser = '';
                    if(data.client) {
                        createCampaign.fetchAdvertisers(data.client.id);
                    }
                    break;
                case 'advertiser' :
                    $scope.workflowData['brands'] = {};
                    $scope.selectedCampaign.brand = '';
                    if(window.location.href.indexOf("edit")>-1){
                                            createCampaign.fetchBrands(data.advertiserId);
                                        }
                    if(data.advertiser) {
                        createCampaign.fetchBrands(data.advertiser.id);
                    }
                    break;
                case 'brand' :
                    if(data.brand) {
                    }
                    break;
            }
        }


        $scope.handleFlightDate = function(data) {
            var startTime = data.startTime;
            var endDateElem = $('#endDateInput')
            var changeDate;
            endDateElem.attr("disabled","disabled").css({'background':'#eee'});
            if(startTime) {
                endDateElem.removeAttr("disabled").css({'background':'transparent'});
                if($scope.dataLength){
                    endDateElem.datepicker("setStartDate", moment($scope.editCampaignData.endTime).format("MM/DD/YYYY"));
                }else{
                    changeDate =  moment(startTime).format('MM/DD/YYYY')
                    endDateElem.datepicker("setStartDate", changeDate);
                    endDateElem.datepicker("update", changeDate);
                }
            }

        }

        $scope.sucessHandler = function(result) {
            var url = '/campaign/'+ result.data.data.id + '/overview';
            $location.url(url);
        }

        $scope.selectCampaignGoal = function(event, goal) {
            $scope.selectedCampaign.goal = goal;
            var currTarget = $(event.currentTarget);
            currTarget.parents('.goalBtnGroup').find('label').removeClass('active')
            currTarget.addClass("active")
        };

        createCampaign.getBrandId = function(brandId, postDataObj) {
            brandId =  Number(brandId);
            if(brandId > 0) {
                postDataObj.brandId =  brandId;
            }
        };

        $scope.saveCampaign = function() {
                    $scope.$broadcast('show-errors-check-validity');
                    if ($scope.createCampaignForm.$valid) {
                        var formElem = $("#createCampaignForm");
                        var formData = formElem.serializeArray();
                        formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
                        var postDataObj = {};
                        createCampaign.getBrandId(formData.brandId, postDataObj);
                        postDataObj.goal = formData.goal.toUpperCase();
                        postDataObj.bookedRevenue = Number(formData.budget);
                        postDataObj.name = formData.campaignName;
                        postDataObj.startTime = moment(formData.startTime).format('YYYY-MM-DD');
                        postDataObj.endTime = moment(formData.endTime).format('YYYY-MM-DD');
                        if(window.location.href.indexOf("edit")>-1)
                        {
                            postDataObj.clientId = $scope.editCampaignData.clientId;
                            postDataObj.advertiserId = $scope.editCampaignData.advertiserId;
                            postDataObj.campaignId=$routeParams.campaignId;
                            $scope.repushCampaignEdit=true;
                            $scope.repushData=postDataObj;
                        }else{
                            postDataObj.clientId = Number(formData.clientId);
                            postDataObj.advertiserId = Number(formData.advertiserId);
                            workflowService.saveCampaign(postDataObj).then(function (result) {
                                if (result.status === "OK" || result.status === "success") {
                                    $scope.sucessHandler(result);
                                    localStorage.setItem( 'topAlertMessage', $scope.textConstants.CAMPAIGN_CREATED_SUCCESS );
                                }
                            });
                        }
                    }
                };
        $scope.repushCampaign=function(){
             $scope.repushCampaignEdit=false;
             workflowService.updateCampaign($scope.repushData,$routeParams.campaignId).then(function (result) { console.log("Json for update");console.log($scope.repushData);
                if (result.status === "OK" || result.status === "success") {
                    $scope.sucessHandler(result);
                    localStorage.setItem( 'topAlertMessage', $scope.textConstants.CAMPAIGN_UPDATED_SUCCESS);
                    localStorage.setItem('campaignData','');
                }
             });

        }
        $scope.cancelRepushCampaign=function(){
            $scope.repushCampaignEdit=false;
            //$('#createCampaignForm')[0].reset();
            localStorage.setItem('campaignData','');
        }
        $scope.reset = function() {
            $scope.$broadcast('show-errors-reset');
            $scope.selectedCampaign = { };
        };

        $scope.getRandom=function() {
            return Math.floor((Math.random()*6)+1);
        },

        $(function() {
                    $('.input-daterange').datepicker({
                        format: "mm/dd/yyyy",
                        orientation: "auto",
                        autoclose: true,
                        todayHighlight: true
                    });
                    if($scope.dataLength){
                        var startDateElem = $('#startDateInput');
                        startDateElem.datepicker("setEndDate", moment($scope.editCampaignData.startTime).format("MM/DD/YYYY"));
                    }else{
                        var startDateElem = $('#startDateInput');
                        var today =  moment().format("MM/DD/YYYY");
                        startDateElem.datepicker("setStartDate", today);
                        startDateElem.datepicker("update", today);
                    }

                })

        createCampaign.clients();
        createCampaign.fetchGoals();
    });
})();

