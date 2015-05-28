(function () {
  'use strict';
  brandsModule.controller('brandsController', function ($scope, brandsModel, brandsService, utils, $rootScope, constants, loginModel, analytics) {

    var search = false;

    var searchCriteria = utils.typeaheadParams;

    //if list is exhausted and nothing more to scroll. This variable prevents making calls to the server.
    $scope.exhausted = false;
    //This prevents from making too many calls during immediate scroll down.
    $scope.fetching = false;

    function resetSearch(){
      searchCriteria.limit = constants.DEFAULT_LIMIT_COUNT;
      searchCriteria.offset = constants.DEFAULT_OFFSET_START;
      $scope.exhausted = false;
    }

    function fetchBrands(search){
      brandsModel.getBrands(function(brandsData){
        //data manipulation was already done in brandsModel, so just need to attach data to scope here
        if(brandsData.length<searchCriteria.limit)
          $scope.exhausted = true;
        $scope.fetching = false;
        $scope.brands = brandsData;
      },searchCriteria,search);
    }

    if(loginModel.getUserId() != undefined)
      fetchBrands(searchCriteria,search);

    $scope.loadMoreBrands = function() {
      searchCriteria.offset += searchCriteria.limit + 1;
      searchCriteria.key = $("#brandsDropdown").val();
      search = false;
      $scope.fetching = true;
      fetchBrands(search);
    };


    $scope.selectBrand = function (brand) {
      $('#brandsDropdown').attr('placeholder', brand.name).val('');
      $scope.brandData.showAll = true;

        $scope.brands.forEach(function (entry) {
            if (brand.id == entry.id) {
                entry.className = 'active';
            } else {
                entry.className = '';
            }
        });
      /*if(brandsModel.getSelectedBrand().id === brand.id) {
          return;
      }*/
      brandsModel.setSelectedBrand(brand);
      brandsModel.callBrandBroadcast(brand);
      analytics.track(loginModel.getUserRole(), constants.GA_BRAND_SELECTED, brand.name, loginModel.getLoginName());
    };

    var eventBrandChangedFromDashBoard = $rootScope.$on(constants.EVENT_BRAND_CHANGED_FROM_DASHBOARD, function(event, brand) {
      $scope.selectBrand(brand);
    });

    $scope.$on('$destroy', function() {
      eventBrandChangedFromDashBoard();
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
      if(searchCriteria.key === searchText)
        return;
      searchCriteria.key = searchText;
      $scope.exhausted = false;
      //Note: In case of search, we have to reset limit and offset values
      resetSearch()  ;
      search = true;
      fetchBrands(search);
    };

    $scope.highlightSearch = function (text, search) {
      return utils.highlightSearch(text, search);
    };
    $scope.brandData = brandsModel.getBrand();
    $(function() {
      $("header").on('click',  '#brandsDropdownDiv',  function(){
        $('.brandsList_ul').scrollTop($(this).offset().top -20+'px')
      });
    });
  });
}());
