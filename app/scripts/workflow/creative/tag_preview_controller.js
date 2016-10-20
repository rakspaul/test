define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('TagPreviewController', [ '$scope', '$rootScope', '$location', 'dataService', 'urlService',
        'utils', 'constants',
        function ($scope, $rootScope, $location, dataService, urlService, utils, constants) {
            var ventorType = $location.path().endsWith('iastagvalidator') ? 'IAS' : 'MOAT';

            $scope.constants = constants;
            $scope.tagType = 'Display';

            $('.commonPagesLoader').hide();
            $('.vendor').text(ventorType);
            $scope.selectType = function(type){
                $scope.tagType = type;
            };

            $scope.generateVistoTag = function(){
                if(!$scope.verificationID || !$scope.tag || !$scope.tagType){
                    $rootScope.setErrAlertMessage(constants.enterDetials);
                    return;
                }
                var data = {
                    'vendorType' : ventorType,
                    'verificationId' : $scope.verificationID,
                    'tag' : $scope.tag,
                    'format' : $scope.tagType
                };
                dataService.post(
                    urlService.getSampleTag(),
                    data,
                    {'Content-Type': 'application/json'}
                ).then(function(res){
                    if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                        $scope.vistoTag = res.data.data.tag || '';
                    }else{
                        $rootScope.setErrAlertMessage(utils.getResponseMsg(res));
                    }
                },function(err){
                    $rootScope.setErrAlertMessage(utils.getResponseMsg(err));
                });
            };

            function appendToIframe(ele){
                $('#tagCnt').empty();
                var ifrm = document.getElementById('tagCnt');
                ifrm = ifrm.contentWindow || ifrm.contentDocument.document || ifrm.contentDocument;
                ifrm.document.open();
                ifrm.document.write(ele);
                ifrm.document.close();
            }

            $scope.preview = function(){
                if($scope.tagType === 'Display'){
                    appendToIframe($scope.vistoTag);
                } else {
                    var url = $scope.vistoTag,
                        vtag = url.substr(url.indexOf('&vtag=') + ('&vtag='.length) , url.length);
                    $.ajax({
                        url: vtag,
                        dataType: 'xml',
                        success: function (result) {
                            var videoURL = $(result).find('MediaFile[type="video/mp4"]').text(),
                                endLength = videoURL.indexOf('.mp4');
                            videoURL = videoURL.substr(0, endLength+4);
                            videoURL = videoURL.substr(videoURL.lastIndexOf('http'),videoURL.length-1);
                            var ele = '<video id="vid2" class="video-js vjs-default-skin" autoplay controls preload="auto" ' +
                                'poster="/scripts/workflow/vast-video/video-poster.jpg" data-setup="{}" ' +
                                'width="640" height="400"><source id ="sourceID" src="' + videoURL + '" ' +
                                'type="video/mp4"><source src="http://video-js.zencoder.com/oceans-clip.webm" ' +
                                'type="video/webm"><source src="http://video-js.zencoder.com/oceans-clip.ogv" ' +
                                'type="video/ogg"><p>Video Playback Not Supported</p></video>';
                            appendToIframe(ele);
                        }
                    });
                }
            };
            $scope.clear = function(){
                $scope.verificationID = '';
                $('#tagCnt').empty();
                $scope.tagType = 'Select Type';
                $scope.tag = '';
                $scope.vistoTag = '';
            };
        }]);
});
