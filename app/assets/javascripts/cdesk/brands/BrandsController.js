(function () {
  'use strict';
  brandsModule.controller('brandsController', function ($scope, brandsModel, utils, $rootScope, constants, loginModel, analytics) {
    var key = '';
    //Default values.
    var limit = constants.DEFAULT_LIMIT_COUNT;
    var offset = constants.DEFAULT_OFFSET_START;
    var search = false;
    //if list is exhausted and nothing more to scroll. This variable prevents making calls to the server.
    $scope.exhausted = false;
    //This prevents from making too many calls during immediate scroll down.
    $scope.fetching = false;

    function resetLimitAndOffset(){
      limit = constants.DEFAULT_LIMIT_COUNT;
      offset = constants.DEFAULT_OFFSET_START;
    }

    function fetchBrands(limit,offset,key,search){
      brandsModel.getBrands(function(brandsData){
        //data manipulation was already done in brandsModel, so just need to attach data to scope here
        if(brandsData.length<limit)
          $scope.exhausted = true;
        $scope.fetching = false;
        $scope.brands = brandsData;
      },limit,offset,key,search);
    }

    fetchBrands(limit,offset,key,search);

    $scope.loadMoreBrands = function() {
      offset += limit + 1;
      key = $("#brandsDropdown").val();
      search = false;
      $scope.fetching = true;
      fetchBrands(limit,offset,key,false);
    };

    $scope.selectBrand = function (brand) {
      $('#brandsDropdown').attr('placeholder', brand.name);
      $('#brandsDropdown').val('');
      $scope.brandData.showAll = true;
      if(brandsModel.getSelectedBrand().id === brand.id) {
        return;
      }
      $scope.brands.forEach(function (entry) {
        if (brand.id == entry.id) {
          entry.className = 'active';
        } else {
          entry.className = '';
        }
      });
      brandsModel.setSelectedBrand(brand);
      $rootScope.$broadcast(constants.EVENT_BRAND_CHANGED, brand);
      analytics.track(loginModel.getUserRole(), constants.GA_BRAND_SELECTED, brand.name, loginModel.getLoginName());
    };

    $rootScope.$on(constants.EVENT_BRAND_CHANGED_FROM_DASHBOARD, function(event, brand) {
      $scope.selectBrand(brand);
    });

    $scope.brandsDropdownClicked = function() {
      if(brandsModel.getBrand().enable === false) {
        return;
      }
      $("#brandsList").toggle();
      $("#cdbMenu").closest(".each_filter").removeClass("filter_dropdown_open");
      $("#brandsList").closest(".each_filter").toggleClass("filter_dropdown_open");
      $("#cdbDropdown").hide();
      $("#profileDropdown").hide();
    };

    $scope.disableShowAll = function() {
      $scope.brandData.showAll = false;
    };

    $scope.searchBrands = function() {
      var searchText = $("#brandsDropdown").val();
      if(key === searchText)
        return;
      key = searchText;
      $scope.exhausted = false;
      //Note: In case of search, we have to reset limit and offset values
      resetLimitAndOffset();
      search = true;
      fetchBrands(limit,offset,key,search);
    };

    $scope.highlightSearch = function (text, search) {
      return utils.highlightSearch(text, search);
    };
    $scope.brandData = brandsModel.getBrand();
  });
}());
