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
    var brands = [brand.allBrandObject];
    return {
        getBrands: function (success,searchCritera,search) {
            if(searchCritera.advertiserId != -1) {
                brandsService.fetchBrands(searchCritera).then(function (response) {
                    //Note: Here search represents, only matching entries list.
                    var resData = response.data.data;
                    if (search) {
                        brands = [];
                        brands.push(brand.allBrandObject);
                    }
                    brands = [{id: -1, name: constants.ALL_BRANDS}].concat(resData);//brands.concat(resData);
                    brand.totalBrands = brands.length;
                    success.call(this, brands);
                })
            }
        },
        setSelectedBrand: function (_brand) {
            brand.selectedBrand = _brand;
            localStorage.setItem('setBrands', JSON.stringify(_brand));
        },
        getSelectedBrand: function() {
            var brands = JSON.parse(localStorage.getItem('setBrands'));
            if(brands !== null){
                brand.selectedBrand = brands;
            }
            return brand.selectedBrand;
        },
        getBrand: function() {
            return brand;
        },
        getAllBrand: function() {
            return brand.allBrandObject;
        },
        disable: function() {
            brand.enable = false;
            brand.cssClass = "brands_filter_disabled";
        },
        enable: function() {
            brand.enable = true;
            brand.cssClass = "";
        },

        callBrandBroadcast :  function(brand) {
            brandsService.preForBrandBroadcast(brand);
        },

        totalBrands: function() {
          return brands.length - 1;
        }

    };
}])
;