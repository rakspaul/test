(function () {
    'use strict';
    campaignSelectWithAllModule.directive('campaignWithAllDropDown', ['utils','campaignSelectWithAllModel','constants', function (utils, campaignSelectWithAllModel,constants) {
        return {
            restrict: 'AE',
            scope: {
                selectedObj: "="
            },
            controller: 'campaignSelectWithAllController',
            templateUrl: assets.html_campaign_drop_down,
            link: function ($scope, element, attrs) {
                $scope.textConstants = constants;
                $scope.headerText = $scope.textConstants.CAMPAIGN;
                if($scope.multiCampaign != undefined) {
                    $scope.headerText = "";
                }
                $('.dropdown_list_scroll').scrollWithInDiv();
                var campaignName = '';
                var localStorageCampaignData;
                $scope.$watch('selectedObj.name', function(v) {
                    localStorageCampaignData = JSON.parse(localStorage.getItem('selectedCampaignAll'));
                    // $("#campaignDropdown").width($(".campaign_name_length").width() + 14 );
                });

                $('#campaign_name_selected').click(function (event) {
                    
                    if ($('#campaigns_list').css('display') === 'block') {
                        $('#campaigns_list').hide();
                    } else {
                        $('#campaigns_list').show();
                    }
                    
                    var inputValue = $('#campaignDropdown').val();
                    if(inputValue) {
                        $('#campaignDropdown').attr('placeholder', inputValue);
                        $('#campaignDropdown').val('');

                    }
                });

                $scope.add_active_selection = function() {
                    $(".dropdown_type2").removeClass("active") ;
                    $(".dropdown_type1_holder").addClass("active");
                };

                $(document).click(function(event) { console.log('am called');
                    localStorageCampaignData = JSON.parse(localStorage.getItem('selectedCampaignAll'));
                    if(event.target.id !== 'campaignDropdown' && event.target.id !== 'campaign_name_selected' && $('#campaigns_list').css('display') == "block" ) {
                        $("#campaigns_list").hide();
                        var inputValue;
                        if(localStorageCampaignData.id || (localStorageCampaignData.id === $scope.$parent.selectedCampaign.id)) {
                            inputValue = localStorageCampaignData.name;
                            if(inputValue) {
                                $('#campaignDropdown').attr('placeholder', '');
                                $(".campaign_name_selected").text(inputValue) ;
                                $('#campaign_name_selected').prop('title', inputValue);
                                $('#campaignDropdown').val(inputValue);
                            }
                        } else {
                            inputValue  = $('#campaignDropdown').attr('placeholder');
                            if(inputValue) {
                                $('#campaignDropdown').attr('placeholder', '');
                                $(".campaign_name_selected").text(inputValue) ;
                                $('#campaign_name_selected').attr('title', inputValue);
                                $('#campaignDropdown').val(inputValue);
                            }
                        }
                        // $("#campaignDropdown").width( $(".campaign_name_length").width() + 14 );

                    }
                });

                // $('#campaignDropdown').keydown(function(event) {
                //     $("#campaignDropdown").width( $(".campaign_name_length").width() + 14 );
                // });
            }
        };
    }]);

}());
