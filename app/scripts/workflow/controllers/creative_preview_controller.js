define(['angularAMD', 'workflow/services/workflow_service', 'login/login_model'], // jshint ignore:line
    function (angularAMD) {
    angularAMD.controller('CreativePreviewController', function ($scope, $rootScope, $routeParams, $location,
                                                         workflowService, loginModel) {
        $scope.creativePreviewUrl = true;

        var creativeId = $routeParams.creativeId,

            extractTagUrl =  function(tag) {
                var url
                if (tag.match(/<SCRIPT.*?SRC="(.*?)"/i) || tag.match(/<SCRIPT.*?SRC='(.*?)'/i)) {
                    url = (tag.match(/<SCRIPT.*?SRC="(.*?)"/i) || tag.match(/<SCRIPT.*?SRC='(.*?)'/i))[1];
                } else if (tag.match(/<script.*?src="(.*?)"/i) || tag.match(/<script.*?src='(.*?)'/i)) {
                    url = (tag.match(/<script.*?src="(.*?)"/i) || tag.match(/<script.*?src='(.*?)'/i))[1];
                }
                return url || tag;
            },

            buildCreativeTagPreviewContainer = function(data) {
                var tag = data.tag,
                    type = data.creativeType,
                    iframe;

                if( tag) {
                    iframe = document.createElement('iframe');
                    if(data.creativeFormat === 'VIDEO') {
                        if(!extractTagUrl(tag)) {
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
                    iframe.frameBorder='0';

                    $('#creativePreviewContainer').append(iframe);

                    $.getScript($scope.creativePreviewUrl, function(res) {
                        console.log('script loaded', res);
                    });
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

        workflowService
            .getCreativeData(creativeId,loginModel.getSelectedClient().id)
            .then(function (result) {
                if (result.status === 'OK' || result.status === 'success') {
                    $scope.creativePreviewData = result.data.data;
                    console.log($scope.creativePreviewData);
                    buildCreativeTagPreviewContainer($scope.creativePreviewData);
                } else {
                    console.log('No data Available to edit');
                }
            });
    });
});
