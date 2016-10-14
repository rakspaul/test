define(['angularAMD', 'sellers-service', 'lrInfiniteScroll'], function (angularAMD) {
    'use strict';

    angularAMD.controller('SellerTargettingController', ['$scope', 'sellersService', 'vistoconfig', function ($scope, sellersService, vistoconfig) {

        var vm = this,
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

                    // show seller in side bar
                    $scope.adData.isSellerSelected = true;

                    // fetch all sellers
                    this.fetchAllSellers();
                },

                buildSellerParams: function () {
                    return {
                        clientId: vistoconfig.getSelectedAccountId(),
                        platformId: $scope.adData.platformId,
                        platformSeatId: $scope.adData.platformSeatId,
                        pageNo: pageNo,
                        search: vm.keywordText
                    };
                },

                /*
                    This method is used to fetch all the sellers initially and
                    in case of edit mode  - make a clone of the sellers the user has previously saved (API RESPONSE) to local array and
                    set isChecked flag to true in sellers list array

                 */

                fetchAllSellers: function () {
                    var params = _sellerTargetting.buildSellerParams();
                    vm.loadMoreFlag = true;
                    sellersService.fetchAllSellers(params).then(function (result) {
                        vm.sellers.sellersList = result.data.data;
                        // TODO delete line
                        vm.sellers.sellersList[0].isPreferred = true;

                        vm.loadMoreFlag = false;

                        //set saved data to the array(the one where we store user selected sellers and set is Checked flag in seller list array)
                        if (!_.isEmpty($scope.adData.sellersTargetting) && !vm.keywordText) {
                            vm.sellers.userSelectedSeller = _.clone($scope.adData.sellersTargetting);
                            _sellerTargetting.checkUserSelectedSellers();
                        }
                    });
                },

                /*
                    This function is used when user scrolls down to load more sellers.
                 */

                loadMoreSellers: function () {
                    var params = _sellerTargetting.buildSellerParams();
                    vm.loadMoreFlag = true;
                    sellersService.fetchAllSellers(params).then(function (result) {
                        result = result.data.data;
                        vm.loadMoreFlag = false;

                        //concat 2 Arrays
                        vm.sellers.sellersList = _.union(vm.sellers.sellersList, result);
                        _sellerTargetting.checkUserSelectedSellers();
                    });


                },

                /*
                    Closes sellers targetting screen and redirects user to targetting screen

                 */

                closeSellersTargetting: function () {
                    $('#sellerTargeting')
                        .delay(300)
                        .animate({
                            left: '100%',
                            marginLeft: '0',
                            opacity: '0.0'
                        }, function () {
                            $(this).hide();
                        });

                    //  seller tag in side bar
                    if($scope.adData.sellersTargetting.length === 0) {
                        $scope.adData.isSellerSelected = false;
                    }
                },

                /*

                    resets page number to 1
                 */

                resetBasicParameters: function () {
                    pageNo = 1;
                },

                /*
                    Sets the isChecked flag in (vm.sellers.sellersList) array based on user selection (vm.sellers.userSelectedSeller)

                 */

                checkUserSelectedSellers: function () {
                    var sellersIds = _.pluck($scope.adData.sellersTargetting, 'id');
                    _.each(sellersIds, function (id) {
                        var index = _.findIndex(vm.sellers.sellersList, function (seller) {
                            return seller.id === id;
                        });
                        if (index !== -1) {
                            vm.sellers.sellersList[index].isChecked = true;

                            // set selectAll flag = true when all sellers are selected
                            if (vm.sellers.userSelectedSeller.length === vm.sellers.sellersList.length) {
                                vm.selectAllChecked = true;
                            }
                        }

                    });
                }
            };


        // Closes Seller Targeting View
        vm.resetSellerTargetingVariables = function () {

            //check if any value is saved previously by user if so copy it and place it in local
            // sellers variable
            vm.sellers.userSelectedSeller = [];
            if ($scope.adData.sellersTargetting.length > 0) {
                vm.sellers.userSelectedSeller = _.clone($scope.adData.sellersTargetting);
                _sellerTargetting.checkUserSelectedSellers();
            }

            //close sellers screen and redirect user to targeting overview screen
            _sellerTargetting.closeSellersTargetting();
        };

        vm.selectAllSeller = function () {
            vm.selectAllChecked = !vm.selectAllChecked;

            //initially set the checked box to whatever the selected flag is assigned and
            // store it in user selected array. Them if the user deselects all sellers
            // then clear the array

            _.each(vm.sellers.sellersList, function (seller) {
                // check if the user has selected the preferred filter
                if (vm.preferedFilterFlag.isPreferred) {


                    // if (seller.isPreferred) {
                    //     // select only the preferred filter
                    //     seller.isChecked = vm.selectAllChecked;
                    //     vm.sellers.userSelectedSeller.push(seller);
                    // } else {
                    //     var index = _.findIndex(vm.sellers.userSelectedSeller,function(sell){
                    //         return seller.id === sell.id
                    //     });
                    //
                    //     if(index !== -1) {
                    //         // select only the preferred filter
                    //         seller.isChecked = vm.selectAllChecked;
                    //         // select only the preferred filter
                    //         vm.sellers.userSelectedSeller.splice(index,1);
                    //     }
                    // }
                    if (seller.isPreferred) {
                        seller.isChecked = vm.selectAllChecked;
                        if (vm.selectAllChecked) {
                            var index = _.findIndex(vm.sellers.userSelectedSeller, function (sell) {
                                return seller.id === sell.id
                            });
                            if (index === -1) {
                                vm.sellers.userSelectedSeller.push(seller);
                            }
                        } else {
                            var index = _.findIndex(vm.sellers.userSelectedSeller, function (sell) {
                                return seller.id === sell.id
                            });
                            if (index !== -1) {
                                vm.sellers.userSelectedSeller.splice(index,1);
                            }
                        }
                    }
                } else {
                    seller.isChecked = vm.selectAllChecked;
                    if(vm.selectAllChecked){
                        var index = _.findIndex(vm.sellers.userSelectedSeller,function(sell){
                            return seller.id === sell.id
                        });
                        if(index === -1) {
                            vm.sellers.userSelectedSeller.push(seller);
                        }
                    } else {
                        vm.sellers.userSelectedSeller = [];
                    }

                }

            });

            // // if the user deselects all the sellers set the array to empty
            // if (!vm.selectAllChecked) {
            //     vm.sellers.userSelectedSeller = [];
            // }


        };

        vm.selectSellers = function (sellers) {
            if (!sellers.isChecked || sellers.isChecked === false) {
                sellers.isChecked = true;
                vm.sellers.userSelectedSeller.push(sellers);

                // set selectAll flag = true when all sellers are selected
                if (vm.sellers.userSelectedSeller.length === vm.sellers.sellersList.length) {
                    vm.selectAllChecked = true;
                }

            } else {
                // find index of object and pop
                var index = _.findIndex(vm.sellers.userSelectedSeller, function (s) {
                    return s.id === sellers.id;
                });

                vm.sellers.userSelectedSeller.splice(index, 1);
                sellers.isChecked = false;
                vm.selectAllChecked = false;


            }
        };

        vm.toggleIncludeExclude = function () {
            vm.includeAllSellersFlag = !vm.includeAllSellersFlag;
        };

        vm.saveSellersList = function () {
            $scope.adData.sellersTargetting = _.clone(vm.sellers.userSelectedSeller);
            $scope.adData.sellersAction = vm.includeAllSellersFlag;

            //close sellers screen and redirect user to targeting overview screen
            _sellerTargetting.closeSellersTargetting();
        };

        vm.loadMoreSellers = function () {
            pageNo++;
            _sellerTargetting.loadMoreSellers();

        };

        vm.searchSellers = function () {
            pageNo = 1;
            vm.sellers.sellersList = [];
            _sellerTargetting.fetchAllSellers();

        };

        vm.removeSearchParam = function() {
            vm.keywordText = '';
            _sellerTargetting.fetchAllSellers();
        }

        $scope.showKeywords = function (event,keywordText) {
            event.stopPropagation();
            vm.keywordText = keywordText;
            if (event.which === 13) {
                vm.searchSellers();
            }
        };

        // used to filter preferred sellers from the sellers list
        vm.setPreferredFlag = function (flag) {
            if (!flag) {
                flag = '';

            }
            vm.preferedFilterFlag.isPreferred = flag;
            $('.preferred-Btn').removeClass('selected');

            if (vm.preferedFilterFlag.isPreferred) {
                $('#preferredBtn').addClass('selected');
            } else {
                $('#showAllBtn').addClass('selected');
            }
        };

        vm.removeUserSelectedSeller = function(sellers) {
            var index = _.findIndex(vm.sellers.userSelectedSeller,function(seller) {
                return seller.id === sellers.id;
            });

            if(index !== -1) {
                vm.sellers.userSelectedSeller.splice(index,1);
                vm.selectAllChecked = false;

                var sellersIndex = _.findIndex(vm.sellers.sellersList,function(seller) {
                    return seller.id === sellers.id;
                });
                if(sellersIndex !== -1){
                    vm.sellers.sellersList[sellersIndex].isChecked = false;
                }
            }
        };

        $scope.$on('triggerSeller', function () {
            _sellerTargetting.resetBasicParameters();
            _sellerTargetting.showSellerTargetingBox();

            if ($scope.adData.sellersAction === false) {
                $('.toggle-event').bootstrapToggle('off');
                vm.includeAllSellersFlag = false;
            }
            vm.preferedFilterFlag.isPreferred = '';
        });


        vm.sellers = {};
        vm.keywordText = '';
        vm.sellers.sellersList = []; // All the sellers fetched from server saved here
        vm.sellers.userSelectedSeller = []; // user selected sellers saved here
        vm.selectAllChecked = false;
        vm.includeAllSellersFlag = true;
        vm.loadMoreFlag = false;
        vm.preferedFilterFlag = {isPreferred: ''};
        $scope.adData.sellersTargetting = [];

    }]);
});
