var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CreativeController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location) {

        if ($location.path() === '/creative/add') {
            $scope.isAddCreativePopup = true;
            $(".main_navigation").find('.active').removeClass('active').end().find('#creative_nav_link').addClass('active');
        }
        $scope.textConstants = constants;
        $scope.workflowData = {};
        $scope.adData = {}
        $scope.adData.screenTypes = [];
        $scope.selectedCreative = {};
        $scope.creativeSizeData = {};
        $scope.addedSuccessfully = false;
        $scope.IncorrectTag = false;
        $scope.disableCancelSave = false;
        $scope.campaignId = $routeParams.campaignId;
        $scope.createAlertMessage = {'message':'','isErrorMsg':0};

        $scope.msgtimeoutReset = function(){
            $timeout(function(){
                $scope.resetAlertMessage() ;
            }, 3000);
        }
        $scope.msgtimeoutReset() ;
        $scope.close_msg_box = function(event) {
            var elem = $(event.target);
            elem.closest(".top_message_box").hide() ;
            $scope.resetAlertMessage() ;
        };

        $scope.resetAlertMessage = function(){
           $scope.createAlertMessage.message = '' ;
        }

        var creatives = {
            /*Function to get creatives sizes*/
            getCreativeSizes: function () {
                workflowService.getCreativeSizes().then(function (result) {
                    console.log("data returned");
                    if (result.status === "OK" || result.status === "success") {
                       // console.log(result.data.data);
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

            fetchAdFormats: function () {
                $scope.creativeSizeData['adFormats'] = [{id: 1, name: 'Display', active: true}, {id: 2,name: 'Video',active: false}, {id: 3, name: 'Rich Media', active: false}, {id: 4, name: 'Social', active: false}]
                $scope.adData.adFormat = 'Display'; //default value
            },

            errorHandler: function (errData) {
                console.log(errData);
            }
        }
        $scope.prarentHandler = function (clientId, clientName, advertiserId, advertiserName) {
            $scope.campaignId = clientId;
            $scope.advertiserId = advertiserId;
            var campaignData = {
                'advertiserId': advertiserId,
                'advertiserName': advertiserName,
                'clientId': clientId,
                'clientName': clientName
            };
            localStorage.setItem('campaignData', JSON.stringify(campaignData))
            creatives.getCreativeSizes(clientId, advertiserId);
            creatives.fetchAdFormats();
        }
        $(function () {

            $("#saveCreative").on('click', function () {
                $scope.$broadcast('show-errors-check-validity');
                if ($scope.formCreativeCreate.$valid) {
                    var formElem = $("#formCreativeCreate");
                    var formData = formElem.serializeArray();
                    formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));

                    var PatternOutside = new RegExp(/<script.*>.*(https:).*<\/script>.*/);
                    var PatternInside = new RegExp(/<script.*(https:).*>.*<\/script>.*/);
                    var tagLower = formData.tag.toLowerCase().replace(' ', '').replace(/(\r\n|\n|\r)/gm, '');
                    if (tagLower.match(PatternOutside)) {
                        if( (tagLower.indexOf('%%tracker%%') > -1)){
                            $scope.creativesave(formData);
                        }
                        else{
                            $scope.IncorrectTag = true;
                            $scope.incorrectTagMessage =$scope.textConstants.WF_INVALID_CREATIVE_TAG_TRACKER;
                        }

                    } else if (tagLower.match(PatternInside)) {
                        if( (tagLower.indexOf('%%tracker%%') > -1)){
                            $scope.creativesave(formData);
                        }
                        else{
                            $scope.IncorrectTag = true;
                            $scope.incorrectTagMessage = $scope.textConstants.WF_INVALID_CREATIVE_TAG_TRACKER;
                        }
                    } else {
                        $scope.IncorrectTag = true;
                        $scope.incorrectTagMessage = "You have entered an invalid Javascript tag.Please review carefully and try again";
                        console.log("Incorrect tag");
                    }
                }
            });
        });
        $scope.creativesave = function (formData) {
            console.log(formData)
            var postCrDataObj = {};
            $scope.IncorrectTag = false;
            postCrDataObj.name = formData.name;
            postCrDataObj.tag = formData.tag;
            postCrDataObj.sizeId = formData.creativeSize;
            postCrDataObj.creativeFormat = formData.creativeFormat && formData.creativeFormat.toUpperCase();
            postCrDataObj.creativeType = formData.creativeType;
            postCrDataObj.sslEnable = "true";
            console.log(postCrDataObj);
            $scope.CrDataObj = postCrDataObj;
            workflowService.saveCreatives($scope.campaignId, $scope.advertiserId, postCrDataObj).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    console.log(result.data);
                    console.log("creative added");
                    $scope.addedSuccessfully = true;
                    $scope.Message = "Creative Added Successfully";
                    workflowService.setNewCreative(result.data.data);
                    $scope.cancelBtn();// redirect user after successful saving
                    $scope.createAlertMessage.message = $scope.textConstants.CREATIVE_SAVE_SUCCESS ;
                    localStorage.setItem( 'topAlertMessage', $scope.textConstants.CREATIVE_SAVE_SUCCESS );

                    $scope.msgtimeoutReset() ;
                } else if (result.data.data.message = "Creative with this tag already exists. If you still want to save, use force save") {
                    $(".popup-holder").css("display", "block");
                    $scope.addedSuccessfully = false;
                    $scope.disableCancelSave = true;

                }
                else {
                    $scope.addedSuccessfully = true;
                    $scope.Message = "Unable to create Creatives";
                    console.log(result);
                }
            });
        }

        $scope.$on('closeAddCreativePage', function () {
            $('#formCreativeCreate')[0].reset();
            $scope.IncorrectTag = false;
            $scope.addedSuccessfully = false;
            $("#formatType").html("Select Format<span class='icon-arrow-down'></span>");
            $("#creativeSize").html("Select Size<span class='icon-arrow-down'></span>");
            $scope.$broadcast('show-errors-reset');
            if ($location.path() === "/creative/add") {
                $window.location.href = "/creative/list";
            } else {
                $(".newCreativeSlide .popCreativeLib").delay(300).animate({
                    left: "100%",
                    marginLeft: "0px"
                }, 'slow', function () {
                    $(this).hide();
                });
                $("#creative").delay(300).animate({height: "530px"}, 'slow');
            }
        })

        $scope.cancelBtn = function () {
            $scope.$broadcast('closeAddCreativePage');
            var winHeight = $(window).height() - 126;
            $(".adStepOne .tab-pane").css('min-height', winHeight-30+'px');
        }

        $scope.switchPlatform = function() {
            $rootScope.$broadcast('switchPlatformFunc');
        }

        $scope.saveDuplicate = function () {
            workflowService.forceSaveCreatives($scope.campaignId, $scope.advertiserId, $scope.CrDataObj).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    console.log("creative Resaved");
                    $(".popup-holder").css("display", "none");
                    $scope.disableCancelSave = false;
                    workflowService.setNewCreative(result.data.data);
                    $scope.cancelBtn();
                } else {
                    $scope.addedSuccessfully = true;
                    $scope.Message = "Unable to create Creatives";
                }
            });
        }

        $scope.dropBoxItemSelected =  function(item, type, event) {
            $scope.adData[type] = item;
        }

        $scope.cancelDuplicate = function () {
            $(".popup-holder").css("display", "none");
            $scope.addedSuccessfully = true;
            $scope.Message = "Unable to create Creatives";
            /*enable cancel, save button on cancel duplicate*/
            $scope.disableCancelSave = false;

        }

        $scope.toggleBtn = function(event) {
            var target = $(event.target);
            var parentElem =  target.parents('.miniToggle')
            parentElem.find("label").removeClass('active');
            target.parent().addClass('active');
            target.attr("checked", "checked");
        };

        $(".dropdown-menu li a").click(function(){
            var selText = $(this).text();
            $(this).parents('.btn-group').find('.dropdown-toggle').html('<span>'+selText+'</span> <span class="caret"></span>');
        });

        // DDL with Search
        $(".dropdown-menu-search li a").click(function(){
            var selText = $(this).text();
            $(this).parents('.btn-group').find('.dropdown-toggle-search').attr('value='+selText);
        });

    });

})();
