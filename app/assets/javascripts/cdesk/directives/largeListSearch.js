(function () {
    'use strict';
    angObj.directive('largeListSearch', function (domainReports) {
        return {
            restrict: 'AE',
            scope: {
                selectedObj: "="
            },
            controller: 'directiveController',
            template: '' +
                ' <div class="pull-left dropdown dropdown_type1">' +
                '<span class="dropdown_ul_text" data-toggle="dropdown">' +
                '<ul class="nav navbar-nav">' +
                '<li class="dropdown" >' +
                '<div id="campaignsDropdownDiv" style="display:inline;">' +
                '<input style="width: 600px;" class="dropdown-toggle inactive dd_txt" ng-model="selectedObj.name" id="campaignDropdown" title="{{selectedObj.name}}" placeholder="{{selectedObj.name }}" data-ng-click="filterDropDown()" />' +
                '<span class="sort-image-inactive" id="#campaignsDropdownDiv"></span>' +
                '</div>' +
                '<ul class="dropdown-menu" role="menu"  id="campaigns_list">' +
                '<li ng-repeat="campaign in campaigns" value="{{campaign.campaign_id}}" _kpi="{{campaign.kpi_type}}" title="{{campaign.name}}" >{{campaign.name }}</li>' +
                '</ul>' +
                '</li>' +
                '</ul>' +
                '<span id="campaign_arrow_img" class="arrrow_img"></span>' +
                '</span>',
            link: function ($scope, element, attrs) {

                $scope.originalCampaingList = $scope.campaigns; // for the first time.
                //Check the status and load the function accordingly for the campaigns list

                    $scope.defaultSelectedCampaing = {
                        name: $scope.$parent.selectedCampaign.name,
                        id: $scope.$parent.selectedCampaign.id
                    }
                  if($scope.defaultSelectedCampaing === 'undefined'){
                      $scope.defaultSelectedCampaing = {
                          name: $scope.campaigns[0].name,
                          id: $scope.campaigns[0].id
                      }
                  }


                $scope.$watch('selectedObj.name', function (oldValue, newValue) {

                    if($scope.defaultSelectedCampaing.name === 'Loading...'){
                        $scope.defaultSelectedCampaing.name = oldValue ;

                        if($scope.$parent.selectedCampaign !== 'undefined'){

                            $scope.defaultSelectedCampaing.id = $scope.$parent.selectedCampaign.id ;
                        }
                    }

                    //update $scope.campaigns to original list for each new search
                    $scope.campaigns = $scope.originalCampaingList;
                    if (oldValue === newValue) {
                        return;
                    }

                    var name = $scope.selectedObj.name.trim();
                    if (newValue !== 'Loading...') {
                        var filteredOptions = [];
                        if (name.length > 0) {
                            var searchFor = angular.lowercase(name);
                            for (var i in $scope.campaigns) {
                                var searchIn = angular.lowercase($scope.campaigns[i].name);
                                //Matches if the user selects from the drop down
                                if (searchFor == searchIn) {
                                    return;
                                } else {
                                    if ((searchIn.indexOf(searchFor) >= 0)) {
                                        filteredOptions.push($scope.campaigns[i]);

                                    }
                                }
                            }
                            $scope.campaigns = filteredOptions;
                        }
                    }
                    if (name.length == 0) {
                        $scope.campaigns = $scope.originalCampaingList;
                    }
                });


                //Function called when the user clicks on the down arrow icon
                $("#campaign_arrow_img").click(function () {
                    if ($('#campaigns_list').css('display') === 'block')
                        $('#campaigns_list').hide();

                    else
                        $('#campaigns_list').show();

                });

                $("#campaignDropdown").click(function () {
                    $('#campaignDropdown').val('');
                    if ($('#campaigns_list').css('display') === 'block'){
                   //     console.log("hiding drop down list");
                        $('#campaigns_list').hide();
                    }

                    else{
                    //    console.log("showing drop down list");
                        $('#campaigns_list').show();

                    }

                });

                $(document).click(function(event) {

                    if(!$("#campaignDropdown").is(':focus')) {
                        if($scope.$parent.selectedCampaign.name.length < 7 || $scope.campaigns.length == 0 ){
                            // restoring previous initial stage.
                            $scope.$parent.selectedCampaign = $scope.defaultSelectedCampaing;

                            $scope.defaultSelectedCampaing = {
                                name : $scope.$parent.selectedCampaign.name,
                                id:  $scope.$parent.selectedCampaign.id
                            }
                            $scope.campaigns = $scope.originalCampaingList;
                        }
                            $("#campaigns_list").hide();
                            $("#campaignDropdown").val($scope.$parent.selectedCampaign.name);

                    }
                });

            }
        }
    });
}());