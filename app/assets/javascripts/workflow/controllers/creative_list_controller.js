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
        $scope.showViewTagPopup=false;
        $scope.edittrue=true;

        //$scope.popUpData.tag="";

        $scope.getAdFormatIconName = function(adFormat) {
            adFormat =  adFormat || 'display';
            var adFormatMapper = {'display' : 'picture', 'video' : 'film', 'rich media' : 'paperclip', 'social' : 'user' }
            return adFormatMapper[adFormat.toLowerCase()];
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
        //$(".successMessage").delay( 300 ).animate({opacity: 1}, 'slow').delay( 1500 ).animate({opacity: 0}, 'slow');


        $scope.ShowHideTag=function(obj){
                        $scope.showViewTagPopup=true;
                        $scope.popUpData=obj;
                        //console.log(obj);
        }

        $scope.updateTag=function(context){ //console.log($scope.popUpData);

            var PatternOutside = new RegExp(/<script.*>.*(https:).*<\/script>.*/);
            var PatternInside =  new RegExp(/<script.*(https:).*>.*<\/script>.*/);
            var tagLower=$scope.popUpData.tag.toLowerCase().replace(' ', '').replace(/(\r\n|\n|\r)/gm,'');
            console.log(tagLower);
            if (tagLower.match(PatternOutside)) {
                    $scope.updateCreative();
            }else if (tagLower.match(PatternInside)) {
                    $scope.updateCreative();
            }else{
                context.IncorrectTag = true;
                context.incorrectTagMessage = "You have entered an invalid Javascript tag.Please review carefully and try again";
                console.log("Incorrect tag");
          }

        }
        $scope.updateCreative=function(){
             var putCrDataObj = {};
             putCrDataObj.name = $scope.popUpData.name;
             putCrDataObj.tag = $scope.popUpData.tag;
             putCrDataObj.sizeId = $scope.popUpData.size.id;
             putCrDataObj.creativeFormat = $scope.popUpData.creativeFormat;
             putCrDataObj.creativeType = $scope.popUpData.creativeType;
             putCrDataObj.sslEnable = "true";
             putCrDataObj.updatedAt= $scope.popUpData.updatedAt;
             console.log("data after forming json:");
             console.log(putCrDataObj);

             workflowService.updateCreative($scope.popUpData.clientId ,$scope.popUpData.advertiserId,$scope.popUpData.id,putCrDataObj).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        console.log("creative updated");
                        $scope.showViewTagPopup=false;
                        $scope.edittrue=true;

                    }
                    else {
                        $scope.IncorrectTag = true;
                        $scope.incorrectTagMessage = "unable to update creative";
                        console.log(result);
                    }
             });

        }
        $scope.editTrue=function(){
            $scope.edittrue=false;
        }

        $scope.cancelPopup=function(){
            $scope.showViewTagPopup=false;
            $scope.edittrue=true;
        }

    });

})();

