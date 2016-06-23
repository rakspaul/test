define(['angularAMD', 'workflow/services/workflow_service',
    'login/login_model'], function (angularAMD) {
    angularAMD.controller('CreativePreviewController', function ($scope, $rootScope, $routeParams, $location,
                                                         workflowService, loginModel) {

        var creativeId = $routeParams.creativeId;
        $scope.creativePreviewUrl = true

        function loadScript(url, callback) {

            var script = document.createElement("script")
            script.type = "text/javascript";

            if (script.readyState) { //IE
                script.onreadystatechange = function () {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        script.onreadystatechange = null;
                        callback();
                    }
                };
            } else { //Others
                script.onload = function () {
                    callback();
                };
            }

            script.src = url;
            document.getElementsByTagName("head")[0].appendChild(script);
        }

        var extractCreativeTag =  function(data) {
            var tag = data.tag,
                type = data.creativeType;
                if( tag) {

                    var iframe = document.createElement('iframe');
                    var html = "<body>"+tag+"</body>";
                    iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);
                    iframe.width = '1000';
                    iframe.height = '1000';
                    iframe.frameBorder="0"

                    $('#creativePreviewContainer').append(iframe);
                    console.log('iframe.contentWindow =', iframe.contentWindow);


                    $.getScript($scope.creativePreviewUrl, function(res) {
                        console.log("script loaded", res)
                    })
                }
            //}
        }

        var buildCreativeTagPreviewContainer = function(creativeData) {
            extractCreativeTag(creativeData);
        }

        workflowService
            .getCreativeData(creativeId,loginModel.getSelectedClient().id)
            .then(function (result) {
                if (result.status === 'OK' || result.status === 'success') {
                    $scope.creativePreviewData = result.data.data;
                    console.log($scope.creativePreviewData);
                    buildCreativeTagPreviewContainer($scope.creativePreviewData)
                } else {
                    console.log('No data Available to edit');
                }
            });
    });
});
