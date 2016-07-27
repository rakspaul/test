define(['angularAMD', 'reporting/advertiser/advertiser_model', 'common/utils',
    'common/services/constants_service', 'common/services/vistoconfig_service',
    'reporting/advertiser/advertiser_directive'], function (angularAMD) {
    'use strict';

    angularAMD.controller('AdvertiserController', function ($scope, $rootScope, $routeParams, $location,
                                                            advertiserModel, utils, constants, vistoconfig) {

        var search = false,
            searchCriteria = utils.typeaheadParams,

            fetchAdvertisers= function () {
                var accountId = $routeParams.subAccountId || $routeParams.accountId;
                advertiserModel.fetchAdvertiserList(accountId).then(function() {
                    $scope.advertisers = advertiserModel.getAdvertiserList();
                    console.log('$scope.advertisers', $scope.advertisers.length);
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
            advertiserModel.changeAdvertiser($routeParams.accountId, $routeParams.subAccountId, advertiser);
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
    });
});
