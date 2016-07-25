define(['angularAMD', 'common/services/constants_service'], function (angularAMD) {
    angularAMD.directive('campaignDropDown', ['constants', function (constants) {
        return {
            restrict: 'AE',

            scope: {
                selectedObj: '=',
                fileIndex: '=',
                multiCampaign: '@',
                allCampaign: '@'
            },

            controller: 'CampaignSelectController',
            templateUrl: assets.html_campaign_drop_down,

            link: function ($scope) {
                var localStorageCampaignData,
                    campaignNameSelected = $('.campaign_name_selected');

                $scope.textConstants = constants;
                $scope.headerText = $scope.textConstants.CAMPAIGN;

                if ($scope.multiCampaign !== undefined) {
                    $scope.headerText = '';
                }

                $('.dropdown_list_scroll').scrollWithInDiv();

                $scope.add_active_selection = function () {
                    $('.dropdown_type2').removeClass('active');
                    $('.dropdown_type1_holder').addClass('active');
                };

                $(document).click(function (event) {
                    var inputValue,
                        campaignsList = $('.campaigns_list'),
                        campaignDropdown = $('#campaignDropdown');

                    if ($scope.allCampaign === 'true' || $scope.allCampaign === true) {
                        localStorageCampaignData = JSON.parse(localStorage.getItem('selectedCampaignAll'));
                    } else {
                        localStorageCampaignData = JSON.parse(localStorage.getItem('selectedCampaign'));
                    }

                    if (( $(event.target).closest('.campaignDropdown').length === 0) &&
                        ( $(event.target).closest('.campaign_name_selected').length === 0)  &&
                        campaignsList.is(':visible') === true ) {
                        campaignsList.hide();

                        if (localStorageCampaignData.id ||
                            (localStorageCampaignData.id === $scope.$parent.selectedCampaign.id)) {
                            inputValue = localStorageCampaignData.name;

                            if (inputValue) {
                                campaignDropdown.attr('placeholder', '');
                                campaignNameSelected.text(inputValue);
                                campaignDropdown.val(inputValue);
                            }
                        } else {
                            inputValue  = campaignDropdown.attr('placeholder');

                            if (inputValue) {
                                campaignDropdown.attr('placeholder', '');
                                campaignNameSelected.text(inputValue);
                                campaignDropdown.val(inputValue);
                            }
                        }
                    }
                });
            }
        };
    }]);
});
