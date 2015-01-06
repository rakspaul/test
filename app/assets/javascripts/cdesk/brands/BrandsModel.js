//Data Manipulation in model
brandsModule.factory("brandsModel", ['brandsService', 'constants', function (brandsService, constants) {
  var brand = {};
  brand.selectedBrand = {id: -1}
  return {
    getBrands: function (success) {
      brandsService.fetchBrands().then(function (response) {
        var brands = [
          {'name': constants.ALL_BRANDS, 'id': -1, 'className': 'active'}
        ].concat(response.data);
        success.call(this, brands);
      })
    },
    setSelectedBrand: function (brand) {
      brand.selectedBrand = brand;
    },
    getSelectedBrand: function() {
      return brand.selectedBrand;
    }
  };
}])
;