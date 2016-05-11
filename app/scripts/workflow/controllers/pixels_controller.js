define(['angularAMD' , 'workflow/services/workflow_service' , 'common/moment_utils' , 'common/utils'],
    function(angularAMD) {
        angularAMD.controller('PixelsController', function($scope , workflowService , momentService , utils) {

            // start of pixels page controller

            $scope.selectedCampaign.selectedPixel = [];
            $scope.selectedCampaign.pixelList = [];
            $scope.selectAllPixelsChecked = false;

            var pixels = {
                fetchPixels: function (pixels) {
                    workflowService.getPixels($scope.selectedCampaign.advertiserId,$scope.selectedCampaign.clientId).then(function (result) {
                        if (result.status === "OK" || result.status === "success") {
                            var responseData = result.data.data;
                            $scope.selectedCampaign.pixelList = _.sortBy(responseData, 'name');
                            _.each($scope.selectedCampaign.pixelList, function( item , i ){
                                item.createdAt = momentService.newMoment(item.createdAt).format('YYYY-MM-DD');
                            });

                            if(pixels && pixels.length >0) {
                                _.each(pixels, function (id) {
                                    var _pixel = _.filter($scope.selectedCampaign.pixelList, function(obj) { return obj.id === id})[0];
                                    $scope.selectPixel(_pixel);
                                })
                            }
                        }
                        else {
                            console.log(result) ;
                        }
                    });
                },

                resetPixel: function () {
                    var i;
                    for (i = 0; i < $scope.selectedCampaign.pixelList.length; i++) {
                        $scope.selectedCampaign.pixelList[i].isChecked = false;
                        $scope.selectedCampaign.pixelList[i].isIncluded = null;
                    }
                }
            };

            //select or unselect indiviual pixels
            $scope.selectPixel = function (pixel) {
                var pixelIndex = _.findIndex($scope.selectedCampaign.selectedPixel, function (item) {
                    return item.id === pixel.id;
                });
                if (pixelIndex === -1) {
                    pixel.isChecked = true;
                    pixel.isIncluded = true;
                    $scope.selectedCampaign.selectedPixel.push(pixel);
                } else {
                    $scope.selectedCampaign.selectedPixel.splice(pixelIndex, 1);
                    var index = _.findIndex($scope.selectedCampaign.pixelList, function (list) {
                        return pixel.id == list.id;
                    })
                    $scope.selectedCampaign.pixelList[index].isChecked = false;
                    $scope.selectedCampaign.pixelList[index].isIncluded = null;

                    // filter line item
                    $scope.filterLineItemBasedOnPixel(pixel.id);
                }
            };

            $scope.selectAllPixel = function (event) {
                var i;
                $scope.selectedCampaign.selectedPixel = []; //empty the selected pixel array before populating/empting it with all the pixel
                $scope.selectAllPixelChecked = event.target.checked;
                if ($scope.selectAllPixelChecked) {
                    for (i = 0; i < $scope.selectedCampaign.pixelList.length; i++) {
                        $scope.selectedCampaign.selectedPixel.push($scope.selectedCampaign.pixelList[i]);
                        $scope.selectedCampaign.pixelList[i].isChecked = true;
                        $scope.selectedCampaign.pixelList[i].isIncluded = true;
                    }
                } else {
                    pixels.resetPixel(); // deselect all
                }
            };

            $scope.clearAllSelectedPixel = function () {
                pixels.resetPixel();
                $scope.selectedCampaign.selectedPixel = [];
            };

            $scope.$on('fetch_pixels' , function(event, args) {
                pixels.fetchPixels(args);
            }) ;

            // end of pixels page controller
        });
    });
