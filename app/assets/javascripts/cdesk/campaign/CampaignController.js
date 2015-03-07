(function () {
    'use strict';

    campaignModule.controller('campaignController', function ($scope, campaignModel, brandsModel, utils, $rootScope, constants, loginModel, analytics) {

       $scope.campaignData = {
           campaigns : {},
           selectedCampaign :  {
               id: -1,
               name : 'No Campaign',
               kpi : 'NA',
               startDate : '-1',
               endDate : '-1'
           }
       };

       console.log("Campaign controller js file starts");
       $scope.fetchCampaigns = function(){

           campaignModel.getCampaigns(brandsModel.getSelectedBrand().id).then(function(){

               var campObj = campaignModel.getCampaignObj();
               $scope.campaignData.campaigns = campObj.allCampaigns ;
               $scope.campaignData.selectedCampaign = campObj.selectedCampaign ;

           });
       };

       $scope.fetchCampaigns();

     //  $scope.campaignObj = campaignModel.getCampaignObj();

//
//        $scope.selectBrand = function (brand) {
//            $('#brandsDropdown').attr('placeholder', brand.name);
//            $('#brandsDropdown').val('');
//            $scope.brandData.showAll = true;
//            if(brandsModel.getSelectedBrand().id === brand.id) {
//                return;
//            }
//            $scope.brands.forEach(function (entry) {
//                if (brand.id == entry.id) {
//                    entry.className = 'active';
//                } else {
//                    entry.className = '';
//                }
//            });
//            brandsModel.setSelectedBrand(brand);
//            $rootScope.$broadcast(constants.EVENT_BRAND_CHANGED, brand);
//            analytics.track(loginModel.getUserRole(), constants.GA_BRAND_SELECTED, brand.name, loginModel.getLoginName());
//        };

//        $rootScope.$on(constants.EVENT_BRAND_CHANGED_FROM_DASHBOARD, function(event, brand) {
//            $scope.selectBrand(brand);
//        });

//        $scope.brandsDropdownClicked = function() {
//            if(brandsModel.getBrand().enable === false) {
//                return;
//            }
//            $("#brandsList").toggle();
//            $("#cdbMenu").closest(".each_filter").removeClass("filter_dropdown_open");
//            $("#brandsList").closest(".each_filter").toggleClass("filter_dropdown_open");
//            $("#cdbDropdown").hide();
//            $("#profileDropdown").hide();
//        };





    });
}());
