//Data Manipulation in model
//advertiserModule.factory("advertiserModel", ['advertiserService', 'constants', function (advertiserService, constants) {
brandsModule.factory("advertiserModel", ['advertiserService', 'constants', function (brandsService, constants, advertiserService) {
    //alert(advertiserService);
    var brand = {};
    brand.allBrandObject = {id: -1, name: constants.ALL_ADVERTISERS};
    brand.selectedBrand = brand.allBrandObject;
    brand.showList = false;
    brand.styleDisplay = "block";
    brand.showAll = true;
    brand.enable = true;
    brand.cssClass = "";
    var advertiserId;
    var brands = [brand.allBrandObject];
    return {

        getAdvertisers: function (success,searchCritera,search,newAdvertiserID) {

            brandsService.fetchAdvertisers(searchCritera,newAdvertiserID).then(function (response) {
                //alert(success);
                //Note: Here search represents, only matching entries list.
                var resData = response.data.data;
                if(search){
                    brands = [];
                    brands.push(brand.allBrandObject);
                }
                brands = brands.concat(resData);
                brand.totalBrands = brands.length;
                success.call(this, brands);
            })/*;
                brandsService.fetchBrands(searchCritera).then(function (response) {
                    //alert(success);
                    //Note: Here search represents, only matching entries list.
                    var resData = response.data.data;
                    if(search){
                        brands = [];
                        brands.push(brand.allBrandObject);
                    }
                    brands = brands.concat(resData);
                    brand.totalBrands = brands.length;
                    success.call(this, brands);
                })*/
        },
        /* Remove and put in adver controller*/
        /* Remove and put in adver controller*/


        setSelectedBrand: function (_brand) {
            brand.selectedBrand = _brand;
            localStorage.setItem('setFrmLocStore', JSON.stringify(_brand));
        },
        getSelectedBrand: function() {
            var fromLocStore = JSON.parse(localStorage.getItem('setFrmLocStore'));
            if(fromLocStore !== null){
                brand.selectedBrand = fromLocStore;
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

        callBrandBroadcast :  function(brand,newBrandID) {// this is really advertiser ID
            var adver ='foo';
            advertiserId = newBrandID;
            brandsService.preForBrandBroadcast(brand);

        }

    };
}])
;