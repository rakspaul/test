define(['angularAMD', 'common/services/constants_service'], function (angularAMD) { // jshint ignore:line
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
            templateUrl: assets.html_campaign_drop_down, // jshint ignore:line

            link: function ($scope) {
                var localStorageCampaignData,
                    campaignNameSelected = $('.campaign_name_selected');

                $scope.textConstants = constants;
                $scope.headerText = $scope.textConstants.CAMPAIGN;

                if ($scope.multiCampaign !== undefined) {
                    $scope.headerText = '';
                }

                $('.dropdown_list_scroll').scrollWithInDiv();

                $scope.$watch('selectedObj.name', function () {
                    if ($scope.allCampaign === 'true' || $scope.allCampaign === true) {
                        localStorageCampaignData = JSON.parse(localStorage.getItem('selectedCampaignAll'));

                        if (localStorageCampaignData !== undefined) {
                            $scope.selectedObj.name = localStorageCampaignData.name;
                        }
                    } else {
                        localStorageCampaignData = JSON.parse(localStorage.getItem('selectedCampaign'));
                    }
                });

                campaignNameSelected.click(function (event) {
                    var elem = $(event.target),
                        campaignsList = $('#campaigns_list'),
                        campaignDropdown = $('#campaignDropdown'),
                        mediaplanDdOpen = $('.mediaplan-dd-open'),
                        inputValue,
                        target,
                        campaignListElem;

                    if ($scope.multiCampaign === undefined) {
                        if (campaignsList.css('display') === 'block') {
                            campaignsList.hide();
                         } else {
                            campaignsList.show();
                         }

                         inputValue = campaignDropdown.val();

                        if (inputValue) {
                            campaignDropdown.attr('placeholder', inputValue);
                            campaignDropdown.val('');
                            $('#campaign_name_selected').val(inputValue);
                            $scope.selectedObj.name = inputValue;
                         }
                    } else {
                        target = $(event.target);
                        campaignListElem = target.closest(".dropdown_type1_holder").find('.campaigns_list');

                        if (campaignListElem.css('display') === 'block') {
                            campaignListElem.hide();
                        } else {
                            campaignListElem.show();
                        }

                        event.preventDefault();
                        event.stopImmediatePropagation();
                    }

                    // to close the other media plan dropdown which is open
                    mediaplanDdOpen.removeClass('mediaplan-dd-open') ;
                    $('.report-type-col .dropdown-menu').hide() ;
                    elem.closest(".dropdown_type1_holder").find('.dropdown_type1').addClass('mediaplan-dd-open') ;
                    $('.dropdown_type1').not('.mediaplan-dd-open').hide() ;
                    mediaplanDdOpen.show() ;
                });

                $scope.add_active_selection = function () {
                    $('.dropdown_type2').removeClass('active') ;
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
                                campaignNameSelected.text(inputValue) ;
                                campaignDropdown.val(inputValue);
                            }
                        } else {
                            inputValue  = campaignDropdown.attr('placeholder');

                            if (inputValue) {
                                campaignDropdown.attr('placeholder', '');
                                campaignNameSelected.text(inputValue) ;
                                campaignDropdown.val(inputValue);
                            }
                        }
                    }
                });
            }
        };
    }]);

});
