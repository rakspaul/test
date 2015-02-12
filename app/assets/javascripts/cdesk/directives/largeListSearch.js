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
                '<span class="campaign_name_length">{{selectedObj.name}}</span>' +
                '</div>' +
                '<ul class="dropdown-menu" role="menu"  id="campaigns_list">' +
                '<li ng-repeat="campaign in campaigns" class="campaigns_list_li" value="{{campaign.campaign_id}}" _kpi="{{campaign.kpi_type}}" title="{{campaign.name}}" >{{campaign.name }}</li>' +
                '</ul>' +
                '</li>' +
                '</ul>' +
                '<span id="campaign_arrow_img" class="arrrow_img"></span>' +
                '</span>',
            link: function ($scope, element, attrs) {

                // $scope.originalAllCampaingList = $scope.allCampaigns ;

               // $scope.originalCampaingList = $scope.campaigns; // for the first time.
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
                    if($scope.selectedObj !== 'undefined'){
                        var name = $scope.selectedObj.name.trim();
                        if (newValue !== 'Loading...') {
                            var filteredOptions = [];
                            if (name.length > 1) {
                                var searchFor = angular.lowercase(name);
                                for (var i in $scope.allCampaigns) {
                                    var searchIn = angular.lowercase($scope.allCampaigns[i].name);
                                    //Matches if the user selects from the drop down
                                    if (searchFor == searchIn) {
                                        return;
                                    } else {
                                        if ((searchIn.indexOf(searchFor) >= 0)) {
                                            filteredOptions.push($scope.allCampaigns[i]);

                                        }
                                    }
                                }
                                $scope.campaigns = filteredOptions;
//                                var searchFor = angular.lowercase(name);
//                                for (var i in $scope.campaigns) {
//                                    var searchIn = angular.lowercase($scope.campaigns[i].name);
//                                    //Matches if the user selects from the drop down
//                                    if (searchFor == searchIn) {
//                                        return;
//                                    } else {
//                                        if ((searchIn.indexOf(searchFor) >= 0)) {
//                                            filteredOptions.push($scope.campaigns[i]);
//
//                                        }
//                                    }
//                                }
//                                $scope.campaigns = filteredOptions;
                            }
                        }
                        if (name.length == 0) {
                            $scope.allCampaigns = $scope.originalAllCampaingList ;
                            $scope.campaigns = $scope.originalCampaingList;
                        }
                    }

                    $(".campaign_name_length").text($("#campaignDropdown").val()) ;
                    $("#campaignDropdown").width( $(".campaign_name_length").width() + 14 ) ;

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

                        if($scope.campaigns.length == 0 || $scope.$parent.selectedCampaign.name.length < 7 ){
                            // restoring previous initial stage.
                            $scope.$parent.selectedCampaign = $scope.defaultSelectedCampaing;

                            $scope.defaultSelectedCampaing = {
                                name : $scope.$parent.selectedCampaign.name,
                                id:  $scope.$parent.selectedCampaign.id
                            }
                            $scope.campaigns = $scope.originalCampaingList;
                            $scope.allCampaigns = $scope.originalAllCampaingList ;
                        }
                            $("#campaigns_list").hide();
                            $("#campaignDropdown").val($scope.$parent.selectedCampaign.name);

                            $(".campaign_name_length").text($("#campaignDropdown").attr("placeHolder")) ;
                            $("#campaignDropdown").width( $(".campaign_name_length").width() + 14 ) ;
                    }
                });

                $(document).ready(function(){
                    
                    $('#campaignDropdown').keydown(function() {
                       $(".campaign_name_length").text($(this).val()) ;
                       $("#campaignDropdown").width( $(".campaign_name_length").width() + 14 ) ;
                    });
                    setTimeout(function(){ 
                       $("#campaignDropdown").width( $(".campaign_name_length").width() + 14 ) ;
                    }, 100);
                    $(".campaigns_list_li").click( function() {
                       $(".campaign_name_length").text($(this).text()) ;
                       $("#campaignDropdown").width( $(".campaign_name_length").width() + 14 ) ;
                    });
                    $("#campaigns_list").click( function() {
                       $(".campaign_name_length").text($("#campaignDropdown").attr("placeHolder")) ;
                       $("#campaignDropdown").width( $(".campaign_name_length").width() + 14 ) ;
                       
                    });
                });

            }
        }
    });
}());
