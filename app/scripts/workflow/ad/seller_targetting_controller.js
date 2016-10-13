define(['angularAMD','sellers-service', 'lrInfiniteScroll'], function (angularAMD) {
    'use strict';

    angularAMD.controller('SellerTargettingController', ['$scope','sellersService', function ($scope,sellersService) {

        var sellerCtrl = this,
            pageNo = 1,
            _sellerTargetting = {
                showSellerTargetingBox: function () {
                    $('#sellerTargeting')
                        .show()
                        .delay(300).animate({
                        left: '50%',
                        marginLeft: '-461px',
                        opacity: '1.0'
                    }, 'slow');
                    $('#seller-toggle-event').bootstrapToggle('on');
                    $('#sellerTargetting').find('.targetting-each-content').show();

                    // fetch all sellers
                    this.fetchAllSellers();



                },
                fetchAllSellers: function(searchText) {
                    console.log($scope.adData);
                     sellersService.fetchAllSellers(pageNo,$scope.adData.platformId,$scope.adData.platformSeatId,searchText).then(function(result) {
                         sellerCtrl.sellers.sellersList = result.data.data;

                         //TODO remove next 3 lines
                         sellerCtrl.sellers.sellersList[1].isPreferred = true;
                         sellerCtrl.sellers.sellersList[3].isPreferred = true;
                         sellerCtrl.sellers.sellersList[5].isPreferred = true;
                         // var index = _.findIndex(sellerCtrl.sellers.sellersList,function(seller) {rCtrl.sellers.sellersList[5].isPreferred = true;

                         //set saved data to the array(the one where we store user selected sellers and set is Checked flag in seller list array)
                         if(!_.isEmpty($scope.adData.sellersTargetting) && !searchText ){
                             sellerCtrl.sellers.userSelectedSeller = _.clone($scope.adData.sellersTargetting);
                             _sellerTargetting.checkUserSelectedSellers();
                         }


                     });



                },
                loadMoreSellers: function() {
                    sellersService.fetchAllSellers(pageNo,$scope.adData.platformId,$scope.adData.platformSeatId).then(function(result) {
                        result = result.data.data;

                        //concat 2 Arrays
                        sellerCtrl.sellers.sellersList = _.union(sellerCtrl.sellers.sellersList, result);
                        _sellerTargetting.checkUserSelectedSellers();
                    });



                },
                closeSellersTargetting: function() {
                    $('#sellerTargeting')
                        .delay(300)
                        .animate({
                            left: '100%',
                            marginLeft: '0',
                            opacity: '0.0'
                        }, function () {
                            $(this).hide();
                        });
                },

                resetBasicParameters: function() {
                    pageNo = 1;
                    //reset search textfield here;

                },

                checkUserSelectedSellers: function() {
                    var sellersIds = _.pluck($scope.adData.sellersTargetting,'id');
                    _.each(sellersIds,function(id) {
                        var index = _.findIndex(sellerCtrl.sellers.sellersList,function(seller) {
                            return seller.id === id;
                        });
                        if(index != -1) {
                            sellerCtrl.sellers.sellersList[index].isChecked = true;

                            // set selectAll flag = true when all sellers are selected
                            if(sellerCtrl.sellers.userSelectedSeller.length === sellerCtrl.sellers.sellersList.length) {
                                sellerCtrl.selectAllChecked = true;
                            }
                        }

                    });
                }
            };



        // Closes Seller Targeting View
        sellerCtrl.resetSellerTargetingVariables = function () {

            //check if any value is saved previously by user if so copy it and place it in local
            // sellers variable
            sellerCtrl.sellers.userSelectedSeller = [];
            if($scope.adData.sellersTargetting.length > 0) {
                sellerCtrl.sellers.userSelectedSeller = _.clone($scope.adData.sellersTargetting);
                _sellerTargetting.checkUserSelectedSellers();
            }

            //close sellers screen and redirect user to targeting overview screen
            _sellerTargetting.closeSellersTargetting();
        };

        sellerCtrl.selectAllSeller = function() {
            sellerCtrl.selectAllChecked = !sellerCtrl.selectAllChecked;

            //initially set the checked box to whatever the selected flag is assigned and
            // store it in user selected array. Them if the user deselects all sellers
            // then clear the array

            _.each(sellerCtrl.sellers.sellersList,function(seller) {
                // check if the user has selected the preferred filter
                if(sellerCtrl.preferedFilterFlag.isPreferred) {
                    if(seller.isPreferred) {
                        // select only the preferred filter
                        seller.isChecked = sellerCtrl.selectAllChecked;
                        sellerCtrl.sellers.userSelectedSeller.push(seller);
                    }
                } else {
                    seller.isChecked = sellerCtrl.selectAllChecked;
                    sellerCtrl.sellers.userSelectedSeller.push(seller);
                }

            });

            // if the user deselects all the sellers set the array to empty
            if(!sellerCtrl.selectAllChecked) {
                sellerCtrl.sellers.userSelectedSeller = [];
            }


        };

        sellerCtrl.selectSellers = function(sellers) {
            if(!sellers.isChecked || sellers.isChecked === false) {
                sellers.isChecked = true;
                sellerCtrl.sellers.userSelectedSeller.push(sellers);

                // set selectAll flag = true when all sellers are selected
                if(sellerCtrl.sellers.userSelectedSeller.length === sellerCtrl.sellers.sellersList.length) {
                    sellerCtrl.selectAllChecked = true;
                }

            } else {
                // find index of object and pop
                var index = _.findIndex(sellerCtrl.sellers.userSelectedSeller, function(s) {
                    return s.id === sellers.id;
                });

                sellerCtrl.sellers.userSelectedSeller.splice(index,1);
                sellers.isChecked = false;
                sellerCtrl.selectAllChecked = false;


            }
        };

        sellerCtrl.toggleIncludeExclude = function() {
            sellerCtrl.includeAllSellersFlag = !sellerCtrl.includeAllSellersFlag;
        };

        sellerCtrl.saveSellersList = function(){
            $scope.adData.sellersTargetting = _.clone(sellerCtrl.sellers.userSelectedSeller);
            $scope.adData.sellersAction = sellerCtrl.includeAllSellersFlag;

            //close sellers screen and redirect user to targeting overview screen
            _sellerTargetting.closeSellersTargetting();
        };

        sellerCtrl.loadMoreSellers = function() {
            pageNo++ ;
            _sellerTargetting.loadMoreSellers();

        };

        sellerCtrl.searchSellers = function(searchText) {
            pageNo = 1 ;
            sellerCtrl.sellers.sellersList = [];
            _sellerTargetting.fetchAllSellers(searchText);

        };

        $scope.showKeywords = function(event, keywordText) {
            event.stopPropagation();
            if (event.which === 13) {
                if (keywordText.length){
                    // fetch audience for keyword entered by user
                    sellerCtrl.searchSellers(keywordText);
                } else {
                    // fetch all audience when user clears the textBox
                    $scope.keywordText = '';
                    sellerCtrl.searchSellers('');
                }
            }
        };

        sellerCtrl.setPreferredFlag = function(flag) {
            sellerCtrl.preferedFilterFlag.isPreferred = flag;
        };

        $scope.$on('triggerSeller', function () {
            _sellerTargetting.showSellerTargetingBox();
            _sellerTargetting.resetBasicParameters();

            if($scope.adData.sellersAction === false){
                $('.toggle-event').bootstrapToggle('off');
                sellerCtrl.includeAllSellersFlag = false;
            }
            sellerCtrl.preferedFilterFlag.isPreferred = false;
        });



        sellerCtrl.sellers = {};
        sellerCtrl.sellers.sellersList = [];
        sellerCtrl.sellers.userSelectedSeller = [];
        sellerCtrl.selectAllChecked = false;
        sellerCtrl.includeAllSellersFlag = true;
        sellerCtrl.preferedFilterFlag = {isPreferred: false};
        $scope.adData.sellersTargetting = [];

    }]);
});
