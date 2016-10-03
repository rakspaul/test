define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('SellerTargettingController', ['$scope', function ($scope) {

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
                fetchAllSellers: function() {
                    sellerCtrl.sellers.sellersList = [{"id": 1,
                        "name": "Seller 1",
                        "vendor_id": 1,
                        "vendor_seat_id" : 1,
                        "source_id" : 2101,
                        "created_at": "",
                        "updated_at": "",
                        "isPrefered": true
                    },
                        {"id": 2,
                            "name": "Seller 2",
                            "vendor_id": 2,
                            "vendor_seat_id" : 2,
                            "source_id" : 2102,
                            "created_at": "",
                            "updated_at": "",
                            "isPrefered": false
                        }
                    ];

                    //set saved data to the array(the one where we store user selected sellers and set is Checked flag in seller list array)
                    if(!_.isEmpty($scope.adData.sellersTargetting)){
                        sellerCtrl.sellers.userSelectedSeller = _.clone($scope.adData.sellersTargetting);

                        //TODO find a better way
                        var sellersIds = _.pluck($scope.adData.sellersTargetting,'id');
                        _.each(sellersIds,function(id) {
                            var index = _.findIndex(sellerCtrl.sellers.sellersList,function(seller) {
                                return seller.id === id;
                            });
                            sellerCtrl.sellers.sellersList[index].isChecked = true;
                        });
                    }
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
                }
            };

        $scope.$on('triggerSeller', function () {
            _sellerTargetting.showSellerTargetingBox();
        });

        // Closes Seller Targeting View
        sellerCtrl.resetSellerTargetingVariables = function () {

            //check if any value is saved previously by user if so copy it and place it in local
            // sellers variable
            sellerCtrl.sellers.userSelectedSeller = [];
            if($scope.adData.sellersTargetting.length > 0) {
                sellerCtrl.sellers.userSelectedSeller = _.clone($scope.adData.sellersTargetting.length);
            }

            //close sellers screen and redirect user to targeting overview screen
            _sellerTargetting.closeSellersTargetting();
        };

        sellerCtrl.selectAllSeller = function() {
            sellerCtrl.selectAllChecked = !sellerCtrl.selectAllChecked;

            //initially set the checked box to whatever the selected flag is assigned and
            // store it in user selected array. Them if the user deselects all sellers
            // clear the array
            _.each(sellerCtrl.sellers.sellersList,function(seller) {
                seller.isChecked = sellerCtrl.selectAllChecked;
                sellerCtrl.sellers.userSelectedSeller.push(seller);
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

            //close sellers screen and redirect user to targeting overview screen
            _sellerTargetting.closeSellersTargetting();
        };



        sellerCtrl.sellers = {};
        sellerCtrl.sellers.sellersList = [];
        sellerCtrl.sellers.userSelectedSeller = [];
        sellerCtrl.selectAllChecked = false;
        sellerCtrl.includeAllSellersFlag = true;
        sellerCtrl.preferedFilterFlag = {isPrefered: ''};
        $scope.adData.sellersTargetting = {};

    }]);
});
