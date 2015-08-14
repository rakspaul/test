var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CreateCampaignController', function ($scope, $window, constants, workflowService,$timeout, $location) {
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
                $scope.workflowData['advertisers'] = {};
                $scope.workflowData['brands'] = {};
                $scope.workflowData['post_value']['clientId'] = data.client.id;
            }
            else if(type == 'advertiser') {
                createCampaign.fetchBrands(data.advertiser.id);
                $scope.workflowData['brands'] = {};
                $scope.workflowData['post_value']['advertiserId'] = data.advertiser.id;
            }

            else if(type === 'brand') {
                $scope.workflowData['post_value']['brandId'] = data.brand.id;

            }
        }


        $scope.handleFlightDate = function(data) {
            var startTime = data.startTime;
            var endDateElem = $('#endDateInput')
            var changeDate;
            endDateElem.attr("disabled","disabled").css({'background':'#eee'});
            if(startTime) {
                endDateElem.removeAttr("disabled").css({'background':'transparent'});
                changeDate =  moment(startTime).format('MM/DD/YYYY')
                endDateElem.datepicker("setStartDate", changeDate);
                endDateElem.datepicker("update", changeDate);
            }

        }

        $scope.sucessHandler = function(result) {
            /*var $elem = $(".succesfulPopMess");
            $elem.show();
            $scope.reset();
            var goalElem = $('.goalBtnGroup').find('label');
            goalElem.find('label').removeClass('active').find('input').removeAttr('checked');
            $(goalElem[0]).find("input").attr("checked", "checked");
            $(goalElem[0]).addClass('active');
            $scope.selectedCampaign.goal =$scope.workflowData['goals'][0];
            $timeout(function(){
                $elem.hide();
            }, 1000)*/
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
                postDataObj.clientId = Number(formData.clientId);
                postDataObj.advertiserId = Number(formData.advertiserId);
                createCampaign.getBrandId(formData.brandId, postDataObj);
                postDataObj.goal = formData.goal.toUpperCase();
                postDataObj.bookedRevenue = Number(formData.budget);
                postDataObj.name = formData.campaignName;
                postDataObj.startTime = moment(formData.startTime).format('YYYY-MM-DD');
                postDataObj.endTime = moment(formData.endTime).format('YYYY-MM-DD');
                workflowService.saveCampaign(postDataObj).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.sucessHandler(result);
                    }
                });
            }
        };

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
                orientation: "top auto",
                autoclose: true,
                todayHighlight: true
            });

            var startDateElem = $('#startDateInput');
            var today =  moment().format("MM/DD/YYYY");
            startDateElem.datepicker("setStartDate", today);
            startDateElem.datepicker("update", today);

        })

        createCampaign.clients();
        createCampaign.fetchGoals();
    });
})();

