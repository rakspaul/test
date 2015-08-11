var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('creativeController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#creative_nav_link').addClass('active');
        $scope.textConstants = constants;
        $scope.workflowData = {};
        $scope.adData = {}
        $scope.adData.screenTypes = [];
        $scope.selectedCreative = {};
        $scope.creativeSizeData = {};
        $scope.addedSuccessfully = false;
        $scope.IncorrectTag = false;
        $scope.campaignId = $routeParams.campaignId;


        var creatives = {
            /*Function to get creatives sizes*/
            getCreativeSizes: function (clientID, adID) {
                workflowService.getCreativeSizes(clientID, adID).then(function (result) {
                    console.log("data returned");
                    if (result.status === "OK" || result.status === "success") {
                        console.log(result.data.data);
                        var responseData = result.data.data;


                        $scope.creativeSizeData['creativeSize'] = responseData;
                        //console.log("responseData"+creativeSizeData);
                    }
                    else {
                        console.log("failed to get creatives sizes");
                        creatives.errorHandler(result);
                    }
                }, creatives.errorHandler);

            },
            errorHandler: function (errData) {
                console.log(errData);
            }
        }
        creatives.getCreativeSizes(5, 6);

        $(function () {

            $("#saveCreative").on('click', function () {
                $scope.$broadcast('show-errors-check-validity');
                if ($scope.formCreativeCreate.$valid) {
                    var formElem = $("#formCreativeCreate");
                    var formData = formElem.serializeArray();
                    formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
                    console.log(formData)
                    var postCrDataObj = {};


                    var matchPattern = new RegExp(/<script>[A-Za-z]*https:.*[A-Za-z]*<\/script>/)
                    if (!formData.tag.match(matchPattern)) {
                        $scope.IncorrectTag = true;
                        $scope.incorrectTagMessage = "You have entered an invalid Javascript tag.Please review carefully and try again";
                        console.log("Incorrect tag")

                    }
                    else {
                        $scope.IncorrectTag = false;
                        postCrDataObj.name = formData.name;
                        postCrDataObj.tag = formData.tag;
                        postCrDataObj.sizeId = formData.creativeSize;
                        postCrDataObj.creativeFormat = formData.creativeFormat;
                        postCrDataObj.creativeType = formData.creativeType;
                        postCrDataObj.sslEnable = "true";
                        postCrDataObj.createdBy = "11127";//remove while committing
                        postCrDataObj.updatedBy = "11127";//remove while committing
                        console.log(postCrDataObj);
                        workflowService.saveCreatives(6, 5, postCrDataObj).then(function (result) {
                            if (result.status === "OK" || result.status === "success") {
                                console.log("creative added");
                                $scope.addedSuccessfully = true;
                                $scope.Message = "Creative Added Successfully";

                            }
                            else {
                                $scope.addedSuccessfully = true;
                                $scope.Message = "Unable to create Creatives";
                                console.log(result);
                            }
                        });

                    }
                }
            });
        });
    });

})();

