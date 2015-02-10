//Data Manipulation in model
brandsModule.factory("brandsModel", ['brandsService', 'constants', function (brandsService, constants) {
  var brand = {};
  brand.allBrandObject = {id: -1, name: constants.ALL_BRANDS};
  brand.selectedBrand = brand.allBrandObject;
  brand.showList = false;
  brand.styleDisplay = "block";
  brand.showAll = true;
  brand.enable = true;
  brand.cssClass = "";
  return {
    getBrands: function (success) {
      brandsService.fetchBrands().then(function (response) {
        var brands = [
          {'name': constants.ALL_BRANDS, 'id': -1, 'className': 'active'}
        ].concat(response.data.data);
        brand.totalBrands = brands.length;
        success.call(this, brands);
      })
    },
    setSelectedBrand: function (_brand) {
      brand.selectedBrand = _brand;
    },
    getSelectedBrand: function() {
      return brand.selectedBrand;
    },
    getBrand: function() {
      return brand;
    },
    disable: function() {
      brand.enable = false;
      brand.cssClass = "brands_filter_disabled"; 
    },
    enable: function() {
      brand.enable = true;
      brand.cssClass = "";
    }

  };
}])
;