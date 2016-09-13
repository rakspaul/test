define(['angularAMD', 'common-utils', 'advertiser-directive'], function (angularAMD) {
    'use strict';

    angularAMD.controller('AdvertiserController', ['$scope', '$rootScope', '$routeParams', '$location',
        'advertiserModel', 'utils', 'constants', 'vistoconfig', function ($scope, $rootScope, $routeParams, $location,
                                                            advertiserModel, utils, constants, vistoconfig) {

        var search = false,
            searchCriteria = utils.typeAheadParams,

            fetchAdvertisers= function () {
                var accountId = $routeParams.subAccountId || $routeParams.accountId;
                advertiserModel.fetchAdvertiserList(accountId).then(function() {
                    $scope.advertisers = advertiserModel.getAdvertiserList();
                    if (advertiserModel.allowedAdvertiser($routeParams.advertiser_id)) {
                        $scope.selectedAdvertiser = vistoconfig.getSelectAdvertiserId();
                    } else {
                        console.log('advertiser not allowed');
                        $location.url('/tmp');
                    }
                });
            };

        $scope.textConstants = constants;

        $scope.selectAdvertiser = function (advertiser) {
            $('#advertisersDropDownList').hide() ;
            $('#advertiser_name_selected').text(advertiser.name);
            $('#advertisersDropdown').attr('placeholder', advertiser.name).val('');
            advertiserModel.changeAdvertiser(advertiser);
        };

        $scope.showAdvertisersDropDown = function () {
            fetchAdvertisers(searchCriteria, search);
            $('#cdbMenu').closest('.each_filter').removeClass('filter_dropdown_open');
            $('#advertisersDropDownList').toggle().closest('.each_filter').toggleClass('filter_dropdown_open');
            $('#cdbDropdown').hide();
            $('#profileDropdown').hide();
        };

        $scope.disableShowAll = function () {
            $scope.advertiserData.showAll = false;
        };

        $scope.highlightSearch = function (text, search) {
            return utils.highlightSearch(text, search);
        };

        $(function () {
            $('header').on('click', '#brandsDropdownDiv', function () {
                $('.advertisersList_ul').scrollTop($(this).offset().top - 20 + 'px');
            });
        });
    }]);
});
