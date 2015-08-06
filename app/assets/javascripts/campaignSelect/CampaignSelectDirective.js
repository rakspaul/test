(function () {
    'use strict';
    campaignSelectModule.directive('campaignDropDown', ['utils','campaignSelectModel','constants', function (utils, campaignSelectModel,constants) {
        return {
            restrict: 'AE',
            scope: {
                selectedObj: "="
            },
            controller: 'campaignSelectController',
            templateUrl: assets.html_campaign_drop_down,
            link: function ($scope, element, attrs) {
                $scope.textConstants = constants;
                $('#campaigns_list').scrollWithInDiv();
                var campaignName = '';
                var localStorageCampaignData;
                $scope.$watch('selectedObj.name', function(v) {
                    localStorageCampaignData = JSON.parse(localStorage.getItem('selectedCampaign'));
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

                $(document).click(function(event) {
                    localStorageCampaignData = JSON.parse(localStorage.getItem('selectedCampaign'));
                    if(event.target.id !== 'campaignDropdown' && event.target.id !== 'campaign_name_selected' && $('#campaigns_list').css('display') == "block" ) {
                        $("#campaigns_list").hide();
                        var inputValue;
                        if(localStorageCampaignData.id || (localStorageCampaignData.id === $scope.$parent.selectedCampaign.id)) {
                            inputValue = localStorageCampaignData.name;
                            if(inputValue) {
                                $('#campaignDropdown').attr('placeholder', '');
                                $(".campaign_name_length").text(inputValue) ;
                                $('#campaignDropdown').val(inputValue);
                            }
                        } else {
                            inputValue  = $('#campaignDropdown').attr('placeholder');
                            if(inputValue) {
                                $('#campaignDropdown').attr('placeholder', '');
                                $(".campaign_name_length").text(inputValue) ;
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
