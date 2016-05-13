define(['angularAMD', 'reporting/advertiser/advertiser_model', 'common/utils', 'common/services/constants_service',
    'login/login_model', 'reporting/advertiser/advertiser_directive', 'reporting/subAccount/sub_account_model'],
    function (angularAMD) {
        angularAMD.controller('AdvertiserController', function ($scope, $rootScope, advertiserModel, utils,
                                                                constants, loginModel,subAccountModel) {
            var search = false,
                searchCriteria = utils.typeaheadParams,
                loadAdvertisers = true,

                eventBrandChangedFromDashBoard = $rootScope.$on(constants.EVENT_ADVERTISER_CHANGED_FROM_DASHBOARD,
                    function (event, args) {
                        $scope.selectAdvertiser(args.advertiser, args.event_type);
                    }
                ),

                accountChanged = $rootScope.$on(constants.ACCOUNT_CHANGED, function (event, args) {
                    var advertiser = advertiserModel.getAllAdvertiser();

                    loadAdvertisers = true;
                    advertiser.referedFrom = 'selectedsubaccount';
                    $scope.selectAdvertiser(advertiser);
                    advertiserModel.setSelectedAdvertisers(advertiser);
                    advertiserModel.callAdvertiserBroadcast(advertiser, args.event_type);
                    // $rootScope.$broadcast('CAMPAIGN_CHANGE');
                });

            function fetchAdvertisers(searchCriteria, search) {
                if (loginModel.getUserId() == undefined) {
                    return;
                }

                if(loadAdvertisers) {
                    searchCriteria.clientId = loginModel.getSelectedClient().id;
                    search = false;
                    loadAdvertisers = false;
                    advertiserModel.getAdvertisers(function(advertisersData) {
                        $scope.advertisers = advertisersData;
                    }, searchCriteria, search);
                }
            }

            $scope.textConstants = constants;

            $scope.advertiserData = advertiserModel.getAdvertiser();

            $scope.selectAdvertiser = function (advertiser, event_type) {
                advertiser.referedFrom = "";

                    $('#advertiser_name_selected').text(advertiser.name);
                $('#advertisersDropdown').attr('placeholder', advertiser.name).val('');
                $scope.advertiserData.showAll = true;
                advertiserModel.setSelectedAdvertisers(advertiser);
                if(!advertiser.referedFrom) {
                    advertiserModel.callAdvertiserBroadcast(advertiser, event_type);
                }
                $scope.selectedAdvertiser = null;
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

            $scope.$on('$destroy', function() {
                accountChanged();
            });

            $(function () {
                $('header').on('click', '#brandsDropdownDiv', function () {
                    $('.advertisersList_ul').scrollTop($(this).offset().top - 20 + 'px');
                });
            });
        });
});
