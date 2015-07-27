var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CreateCampaignController', function ($scope, $window, constants, workflowService,$timeout) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
        $scope.textConstants = constants;
        $scope.workflowData = {};
        $scope.selectedCampaign = {}
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
                $scope.workflowData['goals'] = [{id : 1, name : 'Performance', 'active' : true}, {id : 2, name : 'Brand', 'active' : false}]
                $scope.selectedCampaign.goal =$scope.workflowData['goals'][0];
            },


            errorHandler : function(errData) {
                console.log(errData);
            }
        }


        $scope.workflowData['post_value'] = {};
        $scope.selectHandler =  function(type, data) {
            if(type === 'client') {
                createCampaign.fetchAdvertisers(data.client.id);
                $scope.workflowData['post_value']['clientId'] = data.client.id;
            }
            else if(type == 'advertiser') {
                createCampaign.fetchBrands(data.advertiser.id);
                $scope.workflowData['post_value']['advertiserId'] = data.advertiser.id;
            }

            else if(type === 'brand') {
                $scope.workflowData['post_value']['brandId'] = data.brand.id;

            }
        }


        $scope.handleFlightDate = function(data) {
            var startTime = data.startTime;
            var endDateElem = $('#endDateInput');
            endDateElem.attr("disabled","disabled").css({'background':'#eee'});
            if(startTime) {
                endDateElem.removeAttr("disabled").css({'background':'transparent'});
                var changeDate =  moment(startTime).format('MM/DD/YYYY')
                $('#endDateInput').datepicker("setStartDate", changeDate);
            }
        }

        $scope.sucessHandler = function(form) {
            var $elem = $(".succesfulPopMess");
            $elem.show();
            $scope.reset();
            var goalElem = $('.goalBtnGroup').find('label');
            goalElem.find('label').removeClass('active').find('input').removeAttr('checked');
            $(goalElem[0]).find("input").attr("checked", "checked");
            $(goalElem[0]).addClass('active');
            $timeout(function(){
                $elem.hide();
            }, 1000)
        }

        $scope.selectCampaignGoal = function(event, goal) {
            $scope.selectedCampaign.goal = goal;
            var currTarget = $(event.currentTarget);
            currTarget.parents('.goalBtnGroup').find('label').removeClass('active')
            currTarget.addClass("active")
        }

        $scope.saveCampaign = function() {
            $scope.$broadcast('show-errors-check-validity');
            if ($scope.createCampaignForm.$valid) {
                var formElem = $("#createCampaignForm");
                var formData = formElem.serializeArray();
                formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
                var postDataObj = {};
                postDataObj.clientId = Number(formData.clientId);
                postDataObj.advertiserId = Number(formData.advertiserId);
                postDataObj.brandId = Number(formData.brandId);
                postDataObj.goal = formData.goal.toUpperCase();
                postDataObj.bookedRevenue = Number(formData.budget);
                postDataObj.name = formData.campaignName;
                workflowService.saveCampaign(postDataObj).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.sucessHandler(formElem);
                    }
                });
            }
        };

        $scope.reset = function() {
            $scope.$broadcast('show-errors-reset');
            $scope.selectedCampaign = { };
        };

            $('.input-daterange').datepicker({
                format: "mm/dd/yyyy",
                orientation: "top auto",
                autoclose: true,
                todayHighlight: true
            });

        createCampaign.clients();
        createCampaign.fetchGoals();
    });
})();

