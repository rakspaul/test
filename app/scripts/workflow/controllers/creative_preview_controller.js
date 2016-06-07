define(['angularAMD', 'common/services/constants_service', 'workflow/services/workflow_service',
    'workflow/services/creative_custom_module', 'login/login_model',
    'workflow/directives/ng_upload_hidden'], function (angularAMD) {
    angularAMD.controller('CreativePreviewController', function ($scope, $rootScope, $routeParams, $location, constants,
                                                         workflowService, creativeCustomModule, loginModel) {

        var creativeId = $routeParams.creativeId;

        workflowService
            .getCreativeData(creativeId,loginModel.getSelectedClient().id)
            .then(function (result) {
                if (result.status === 'OK' || result.status === 'success') {
                    $scope.creativePreviewData = result.data.data;
                    $("#creativePreviewContainer").html($scope.creativePreviewData.tag)
                    console.log($scope.creativePreviewData);
                } else {
                    console.log('No data Available to edit');
                }
            });
    });
});
