define(['angularAMD' , 'workflow/services/workflow_service' , 'common/moment_utils' , 'common/utils'],
    function(angularAMD) {
        angularAMD.controller('PixelsController', function($scope , workflowService , momentService , utils) {

            // start of pixels page controller

            $scope.selectedPixel = [];
            $scope.pixelList = [];
            $scope.selectAllPixelsChecked = false;


            var _pixelTargetting = {
                resetPixel: function () {
                    var i;
                    for (i = 0; i < $scope.pixelList.length; i++) {
                        $scope.pixelList[i].isChecked = false;
                        $scope.pixelList[i].isIncluded = null;
                    }
                }


            }

            var pixels = {
                fetchPixels: function (clientId,advertiserId) {
                    workflowService.getPixels($scope.selectedCampaign.advertiserId,$scope.selectedCampaign.clientId).then(function (result) {
                        if (result.status === "OK" || result.status === "success") {
                            var responseData = result.data.data;
                            $scope.pixelList = _.sortBy(responseData, 'name');
                            _.each($scope.pixelList, function( item , i ){
                                item.createdAt = momentService.newMoment(item.createdAt).format('YYYY-MM-DD');
                            });
                        }
                        else {
                            console.log(result) ;
                        }
                    });
                }
            };


            $scope.$on('fetch_pixels' , function() {
                pixels.fetchPixels() ;
            }) ;

            //select or unselect indiviual pixels
            $scope.selectPixel = function (pixel) {
                var pixelIndex = _.findIndex($scope.selectedPixel, function (item) {
                    return item.id === pixel.id;
                });
                if (pixelIndex === -1) {
                    pixel.isChecked = true;
                    pixel.isIncluded = true;
                    $scope.selectedPixel.push(pixel);
                } else {
                    $scope.selectedPixel.splice(pixelIndex, 1);
                    var index = _.findIndex($scope.pixelList, function (list) {
                        return pixel.id == list.id;
                    })
                    $scope.pixelList[index].isChecked = false;
                    $scope.pixelList[index].isIncluded = null;
                }
            };


            $scope.selectAllPixel = function (event) {
                var i;
                $scope.selectedPixel = []; //empty the selected pixel array before populating/empting it with all the pixel
                $scope.selectAllPixelChecked = event.target.checked;
                if ($scope.selectAllPixelChecked) {
                    for (i = 0; i < $scope.pixelList.length; i++) {
                        $scope.selectedPixel.push($scope.pixelList[i]);
                        $scope.pixelList[i].isChecked = true;
                        $scope.pixelList[i].isIncluded = true;
                    }
                } else {
                    _pixelTargetting.resetPixel(); // deselect all
                }
            };

            $scope.clearAllSelectedPixel = function () {
                _pixelTargetting.resetPixel();
                $scope.selectedPixel = [];
            };

            // end of pixels page controller
        });
    });
