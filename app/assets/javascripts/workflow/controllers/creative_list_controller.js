var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('creativeListController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#creative_nav_link').addClass('active');
        $scope.textConstants = constants;
        $scope.creativeData = {};
        $scope.adData= {}
        $scope.adData.screenTypes =[];
        $scope.creativeListLoading = true;
        $scope.creativesNotFound = false;

        $scope.getAdFormatIconName = function(adFormat) {
            adFormat =  adFormat || 'display';
            var adFormatMapper = {'display' : 'picture', 'video' : 'film', 'rich media' : 'paperclip', 'social' : 'user' }
            return adFormatMapper[adFormat.toLowerCase()];
        }
        $scope.ShowHideTag = function (event) {
            var elem = $(event.target); 
            if( elem.siblings(".script_tag").is(":visible") ) {
                elem.siblings(".script_tag").hide() ;
                elem.text("View Tag") ;
            } else {
                elem.siblings(".script_tag").show() ; 
                elem.text("Hide Tag") ;
            }
        }
        var creativeList = {

            getCreativesList : function(campaignId, advertiserId) {
                workflowService.getCreatives(campaignId, advertiserId).then(function (result) {
                    if (result.status === "OK" || result.status === "success" && result.data.data.length >0) {
                        $scope.creativeListLoading = false;
                        $scope.creativesNotFound = false;
                        $scope.creativeData['creatives'] = result.data.data;
                        $scope.creativeData['creatives_count'] = result.data.data.length;
                    } else {
                        creativeList.errorHandler()
                    }
                }, creativeList.errorHandler);
            },

            errorHandler : function() {
                $scope.creativesNotFound = true;
                $scope.creativeListLoading = false;
            }
        };

        $scope.campaignId = $routeParams.campaignId;

        $scope.formatDate = function(date) {
            return moment(date).format('MMM DD YYYY')
        }


        $scope.prarentHandler = function(campaignId, advertiserId) {
            $scope.creativeData= {};
            if(campaignId && advertiserId) {
                $scope.creativeListLoading = true;
                $scope.creativesNotFound = false;
                creativeList.getCreativesList(campaignId, advertiserId);
            } else {
                $scope.creativeListLoading = false;
                $scope.creativesNotFound = true;
            }
        }
        
        // Success Message Show/Hide
        // If tag was added successfully run this
        $(".successMessage").delay( 300 ).animate({opacity: 1}, 'slow').delay( 1500 ).animate({opacity: 0}, 'slow');
    });

})();

