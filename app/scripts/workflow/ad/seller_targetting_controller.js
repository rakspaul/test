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
                    }
                },

                /*


                 */

                fetchAllSellers: function () {
                    var params = _sellerTargetting.buildSellerParams();
                    sellersService.fetchAllSellers(params).then(function (result) {
                        vm.sellers.sellersList = result.data.data;

                        //set saved data to the array(the one where we store user selected sellers and set is Checked flag in seller list array)
                        if (!_.isEmpty($scope.adData.sellersTargetting) && !vm.keywordText) {
                            vm.sellers.userSelectedSeller = _.clone($scope.adData.sellersTargetting);
                            _sellerTargetting.checkUserSelectedSellers();
                        }
                    });
                },

                /*


                 */

                loadMoreSellers: function () {
                    var params = _sellerTargetting.buildSellerParams();
                    sellersService.fetchAllSellers(params).then(function (result) {
                        result = result.data.data;

                        //concat 2 Arrays
                        vm.sellers.sellersList = _.union(vm.sellers.sellersList, result);
                        _sellerTargetting.checkUserSelectedSellers();
                    });


                },

                /*


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
                },

                /*


                 */

                resetBasicParameters: function () {
                    pageNo = 1;
                },

                /*


                 */

                checkUserSelectedSellers: function () {
                    var sellersIds = _.pluck($scope.adData.sellersTargetting, 'id');
                    _.each(sellersIds, function (id) {
                        var index = _.findIndex(vm.sellers.sellersList, function (seller) {
                            return seller.id === id;
                        });
                        if (index != -1) {
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
                    if (seller.isPreferred) {
                        // select only the preferred filter
                        seller.isChecked = vm.selectAllChecked;
                        vm.sellers.userSelectedSeller.push(seller);
                    }
                } else {
                    seller.isChecked = vm.selectAllChecked;
                    vm.sellers.userSelectedSeller.push(seller);
                }

            });

            // if the user deselects all the sellers set the array to empty
            if (!vm.selectAllChecked) {
                vm.sellers.userSelectedSeller = [];
            }


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

        $scope.showKeywords = function (event,keywordText) {
            event.stopPropagation();
            vm.keywordText = keywordText;
            if (event.which === 13) {
                vm.searchSellers();
            }
        };

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

        $scope.$on('triggerSeller', function () {
            _sellerTargetting.showSellerTargetingBox();
            _sellerTargetting.resetBasicParameters();

            if ($scope.adData.sellersAction === false) {
                $('.toggle-event').bootstrapToggle('off');
                vm.includeAllSellersFlag = false;
            }
            vm.preferedFilterFlag.isPreferred = '';
        });


        vm.sellers = {};
        vm.keywordText = '';
        vm.sellers.sellersList = [];
        vm.sellers.userSelectedSeller = [];
        vm.selectAllChecked = false;
        vm.includeAllSellersFlag = true;
        vm.preferedFilterFlag = {isPreferred: ''};
        $scope.adData.sellersTargetting = [];

    }]);
});
