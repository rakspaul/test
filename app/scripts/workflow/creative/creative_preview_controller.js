define(['angularAMD', '../services/workflow_service', 'login/login_model', 'reporting/advertiser/advertiser_model',
    'common/services/local_storage_service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('CreativePreviewController', function ($scope, $rootScope, $routeParams, $location,
                                                                 workflowService, loginModel, advertiserModel,
                                                             localStorageService) {
        var params = {
                campaignId: $routeParams.campaignId,
                adId: $routeParams.adId,
                creativeId: Number($routeParams.creativeId),
                clientId: $routeParams.clientId,
                advertiserId: $routeParams.advertiserId
            },

            extractTagUrl = function (tag) {
                var url;
                if (tag.match(/<SCRIPT.*?SRC="(.*?)"/i) || tag.match(/<SCRIPT.*?SRC='(.*?)'/i)) {
                    url = (tag.match(/<SCRIPT.*?SRC="(.*?)"/i) || tag.match(/<SCRIPT.*?SRC='(.*?)'/i))[1];
                } else if (tag.match(/<script.*?src="(.*?)"/i) || tag.match(/<script.*?src='(.*?)'/i)) {
                    url = (tag.match(/<script.*?src="(.*?)"/i) || tag.match(/<script.*?src='(.*?)'/i))[1];
                }
                return url || tag;
            },

            buildCreativeTagPreviewContainer = function (data) {
                var tag = data.tag,
                    iFrame;

                if (tag) {
                    iFrame = document.createElement('iFrame');
                    if (data.creativeFormat === 'VIDEO' || data.creativeType === 'VIDEO') {
                        if (!extractTagUrl(tag)) {
                            $scope.creativePreviewUrl = false;
                        } else {
                            // setting creative tag in local storage to use while video preview.
                            localStorage.setItem('creativeTag', extractTagUrl(tag));

                            iFrame.src = '/views/workflow/vast-video-preview.html';
                        }
                    } else {
                        iFrame.src = 'data:text/html;charset=utf-8,' + encodeURI('<body>' + tag + '</body>');
                    }

                    iFrame.width = '1000';
                    iFrame.height = '1000';
                    iFrame.frameBorder = '0';

                    $('#creativePreviewContainer').append(iFrame);
                }
            };

        $scope.creativePreviewUrl = true;

        if (params.creativeId === -1) {
            $scope.creativePreviewData = localStorageService.creativeTag.get();
            buildCreativeTagPreviewContainer($scope.creativePreviewData);
            $scope.creativePreviewUrl = true;
        } else {
            workflowService
                .getCreativePreViewData(params)
                .then(function (result) {
                    var winTitle = '';

                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.creativePreviewData = result.data.data;

                        if($scope.creativePreviewData.name) {
                            winTitle +=  $scope.creativePreviewData.name;
                        }

                        if($scope.creativePreviewData.adName) {
                            winTitle +=  ' | ' + $scope.creativePreviewData.adName;
                        }

                        if($scope.creativePreviewData.platformName) {
                            winTitle +=  ' | ' + $scope.creativePreviewData.platformName;
                        }

                        $rootScope.title = winTitle;
                        buildCreativeTagPreviewContainer($scope.creativePreviewData);
                    } else {
                        $scope.creativePreviewUrl = false;
                        console.log('err');
                    }
                });
        }
    });
});
