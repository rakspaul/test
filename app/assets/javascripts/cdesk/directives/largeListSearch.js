//
//angObj.directive('largeListSearch', function(){
//    return {
//        restrict: 'AE',
//        scope:{
//            selectedObj:'=',
//            listColumns: "=",
//            showSearchBtn:"="
//        },
//        template: '<ul class="nav navbar-nav">'+
//            '<li class="dropdown" >'+
//            '<div id="brandsDropdownDiv" style="display:inline;">'+
//            '<input style="width: 300px;" class="dropdown-toggle inactive dd_txt" ng-model="selectedObj.name" id="campaignDropdown" title="{{selectedObj.name}}" placeholder="{{selectedObj.name | formatUrl}}" />'+
//            '<input type="button" value="Search" id="element" style="display: none" data-ng-click="filterDropDown()" />'+
//            '<span class="sort-image-inactive" id="#brandsDropDownImg"></span>'+
//            '</div>'+
//            '<ul class="dropdown-menu" role="menu"  id="campaigns_list">'+
//            '<li ng-repeat="campaign in listColumns" value="{{campaign.campaign_id}}" title="{{campaign.name}}" >{{campaign.name | formatUrl}}</li>'+
//            '</ul>'+
//            '</li>'+
//            '</ul>',
//        link: function ($scope, element, attrs) {
//
//            //Check the status and load the function accordingly for the campaigns list
//            if(attrs.showSearchBtn === "true") {
//                $('#element').show();
//
//                $scope.filterDropDown = function(){
//                    var name = $scope.$parent.selectedCampaign.name.trim();
//                    if(name !== 'Loading...') {
//                        var filteredOptions = [];
//                        var showPreviousList=false;
//                        if (name.length > 0) {
//                            var searchFor = angular.lowercase(name);
//                            for (var i in $scope.$parent.campaingnsFullList) {
//                                var searchIn = angular.lowercase($scope.$parent.campaingnsFullList[i].name);
//                                //Matches if the user selects from the drop down
//                                if(searchFor == searchIn) {
//                                    return;
//                                } else {
//                                    if ((searchIn.indexOf(searchFor) >= 0)) {
//                                        filteredOptions.push($scope.$parent.campaingnsFullList[i]);
//                                    }
//                                }
//                            }
//                            $scope.$parent.campaingns = filteredOptions;
//                        }
//                    }
//                    if(name.length == 0){
//                        $scope.campaingns = $scope.$parent.campaingnsFullList.slice(0,10);
//                    }
//                };
//            }else{
//                $scope.$watch('selectedObj.name', function(oldValue, newValue){
//                    if(oldValue === newValue) {
//                        return;
//                    }
//                    var name = $scope.selectedObj.name.trim();
//                    if(newValue !== 'Loading...') {
//                        var filteredOptions = [];
//                        var showPreviousList=false;
//                        if (name.length > 0) {
//                            var searchFor = angular.lowercase(name);
//                            for (var i in $scope.$parent.campaingnsFullList) {
//                                var searchIn = angular.lowercase($scope.$parent.campaingnsFullList[i].name);
//                                //Matches if the user selects from the drop down
//                                if(searchFor == searchIn) {
//                                    return;
//                                } else {
//                                    if ((searchIn.indexOf(searchFor) >= 0)) {
//                                        filteredOptions.push($scope.$parent.campaingnsFullList[i]);
//                                    }
//                                }
//                            }
//                            $scope.$parent.campaingns = filteredOptions;
//                        }
//                    }
//                    if(name.length == 0){
//                        $scope.campaingns = $scope.$parent.campaingnsFullList.slice(0,10);
//                    }
//                });
//            }
//
//
//            //Function called when the user clicks on the campaign dropdown
//            $('#campaigns_list').click(function (e) {
//                // $('.page_loading').css({'display': 'block'});
//                if($scope.$parent.checkStatus()) {
//                    $scope.$parent.selectedCampaign.id = $(e.target).attr('value');
//                    $scope.$parent.selectedCampaign.name = $(e.target).text();
//                    $('#campaigns_list').toggle();
//                    $scope.$apply();
//                    $scope.$parent.strategylist($scope.$parent.selectedCampaign.id);
//                }
//            });
//
//            //Function called when the user focus on the input box
//            $("#campaignDropdown").focus(function(){
//                $('#campaigns_list').css({'display' : 'block'});
//            });
//            //Function called when the user clicks on the down arrow icon
//            $("#campaign_arrow_img").click(function(){
//                $('#campaigns_list').toggle();
//            });
//        }
//    }
//});