define(['angularAMD',
        'workflow/services/workflow_service', 'login/login_model', 'reporting/advertiser/advertiser_model',
        'common/services/local_storage_service'], // jshint ignore:line
    function (angularAMD) {
        'use strict';

        angularAMD.controller('CreativePreviewController', function ($scope, $rootScope, $routeParams, $location, workflowService, loginModel, advertiserModel, localStorageService) {
            $scope.creativePreviewUrl = true;

            var params = {
                'campaignId': $routeParams.campaignId,
                'adId': $routeParams.adId,
                'creativeId': $routeParams.creativeId,
                'clientId': $routeParams.clientId,
                'advertiserId': $routeParams.advertiserId
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
                    type = data.creativeType,
                    iframe;

                if (tag) {
                    iframe = document.createElement('iframe');
                    if (data.creativeFormat === 'VIDEO') {
                        if (!extractTagUrl(tag)) {
                            $scope.creativePreviewUrl = false;
                        } else {
                            localStorage.setItem('creativeTag', extractTagUrl(tag)); //setting creative tag in local storage to use while video preview.
                            iframe.src = '/views/workflow/vast-video-preview.html';
                        }
                    } else {
                        iframe.src = 'data:text/html;charset=utf-8,' + encodeURI('<body>' + tag + '</body>');
                    }
                    iframe.width = '1000';
                    iframe.height = '1000';
                    iframe.frameBorder = '0';

                    $('#creativePreviewContainer').append(iframe);
                }
            };


            function loadScript(url, callback) { // jshint ignore:line
                var script = document.createElement('script');

                script.type = 'text/javascript';

                if (script.readyState) {
                    //IE
                    script.onreadystatechange = function () {
                        if (script.readyState === 'loaded' || script.readyState === 'complete') {
                            script.onreadystatechange = null;
                            callback();
                        }
                    };
                } else {
                    //Others
                    script.onload = function () {
                        callback();
                    };
                }

                script.src = url;
                document.getElementsByTagName('head')[0].appendChild(script);
            }


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
                            console.log("err");
                        }
                    });

            }
        });
    });
