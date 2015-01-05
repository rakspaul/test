(function () {
    'use strict';
    angObj.directive('campaignActivityPopup', function (utils, $document, $window) {
        return {
            restrict:'EAC',

            scope: {
                campaigns: '='
            },

            templateUrl: 'campaign_activity_popup',

            link: function ($scope, element, attrs) {
                //element.data('popup',true);
                
              //  angular.element($document[0].body).on('click',function(e) {
              // // var onPopup =  angular.element(e.target).inheritedData('popup');
              //  if(angular.element(e.target).context.className == "main_container ng-scope" ){
              //        //if (onPopup) {
              //           //$scope.$parent.editActivity = false;
              //           //alert('close');
              //           //$scope.$parent.closeEdit();
              //       //}
              //   }

              //  })
                
            } 
        };
    });

}());