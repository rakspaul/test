var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('viewabilityController', function ($scope, viewablityService, utils, dataTransferService, domainReports, apiPaths) {

        $scope.selectedCampaign = domainReports.getDefaultValues();

        $scope.selectedStrategy = domainReports.getDefaultValues();

        $scope.selected_filters = domainReports.getDurationKpi();

        $scope.filters = domainReports.getReportsDropDowns();

        $scope.strategiesList={
            tacticsList:[]
        };

        $scope.download_urls = {
            tactics: null,
            domains: null,
            publishers: null,
            exchanges: null
        };
        var urlPath = apiPaths.apiSerivicesUrl+'/campaigns/'+ $scope.selectedCampaign.id +'/viewability/';


        $scope.tacticViewData= function (param, strategiesList) {
            viewablityService.getTacticsViewData(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {

                    strategiesList.tacticsList = result.data.data[0].tactics;
                    $scope.strategiesList =strategiesList;
                } // Means no strategy data found
                else {
                }
            });
        };


        //Function called to show Strategy list
        $scope.strategyViewData = function (param) {
              var strategiesList = {} ;
              $scope.dataNotFound= true;
                viewablityService.getStrategyViewData(param).then(function (result) {
               //  console.log(result);
                if (result.status === "OK" || result.status === "success") {
                 //   console.log("came insiede");
                  //  console.log(result);
                    strategiesList = result.data.data;
                    if(strategiesList) {
                        $scope.dataNotFound= false;
                        $scope.tacticViewData(param, strategiesList);

                    }else{
                        $scope.dataNotFound= true;
                    }

                } // Means no strategy data found
                else {
                    $scope.dataNotFound= true;
                }
            });
        };

        //This function is called from the directive, onchange of the dropdown
        $scope.onKpiDurationChange = function(kpiType) {
            if (kpiType == 'duration') {
                $scope.getStrategyList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
                dataTransferService.updateExistingStorageObjects({'filterDurationType' : $scope.selected_filters.time_filter, 'filterDurationValue' : $scope.selected_filters.time_filter_text});
                var urlPath = apiPaths.apiSerivicesUrl+'/campaigns/'+ $scope.selectedCampaign.id +'/viewability/';
                $scope.download_urls = {
                    tactics: urlPath+'tactics/download?date_filter='+  $scope.selected_filters.time_filter,
                    domains:  urlPath+'domains/download?date_filter='+  $scope.selected_filters.time_filter,
                    publishers:  urlPath+'publishers/download?date_filter='+  $scope.selected_filters.time_filter,
                    exchanges: urlPath+'exchanges/download?date_filter='+  $scope.selected_filters.time_filter
                };
            }else{
                $scope.$apply();
                dataTransferService.updateExistingStorageObjects({'filterKpiType' : $scope.selected_filters.kpi_type, 'filterKpiValue' : $scope.selected_filters.kpi_type_text});
            }
        };

        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        //Campaign  List
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        $scope.campaigns = {};
        $scope.setCampaigns = function(campaigns){
            $scope.campaigns = campaigns;
         //   $scope.campaignFullList = campaigns;
            if (typeof  $scope.campaingns !== 'undefined' && $scope.campaingns.length > 0) {
                //Maintain the selected campaign name and id;
                $scope.selectedCampaign = domainReports.getFound($scope.campaingns[0])['campaign'];
                $scope.selected_filters.kpi_type = dataTransferService.getDomainReportsValue('filterKpiType') ? dataTransferService.getDomainReportsValue('filterKpiType') : $scope.campaingns[0].kpi_type;
                $scope.selected_filters.kpi_type_text = dataTransferService.getDomainReportsValue('filterKpiValue') ? dataTransferService.getDomainReportsValue('filterKpiValue') : ($scope.campaingns[0].kpi_type === 'action_rate') ? 'Action Rate' : $scope.campaingns[0].kpi_type,
                    dataTransferService.updateExistingStorageObjects({
                        filterKpiType: dataTransferService.getDomainReportsValue('filterKpiType') ? dataTransferService.getDomainReportsValue('filterKpiType') : $scope.selected_filters.kpi_type,
                        filterKpiValue : dataTransferService.getDomainReportsValue('filterKpiValue') ? dataTransferService.getDomainReportsValue('filterKpiValue') : $scope.selected_filters.kpi_type_text
                    });

                /*$scope.selectedCampaign.id =  dataTransferService.getDomainReportsValue('campaignId') ? dataTransferService.getDomainReportsValue('campaignId') : $scope.campaingns[0].campaign_id;
                $scope.selectedCampaign.name = dataTransferService.getDomainReportsValue('campaignName') ? dataTransferService.getDomainReportsValue('campaignName') :  $scope.campaingns[0].name;*/
                var urlPath = apiPaths.apiSerivicesUrl+'/campaigns/'+ $scope.selectedCampaign.id +'/viewability/';
                $scope.download_urls = {
                    tactics: urlPath+'tactics/download?date_filter='+  $scope.selected_filters.time_filter,
                    domains:  urlPath+'domains/download?date_filter='+  $scope.selected_filters.time_filter,
                    publishers:  urlPath+'publishers/download?date_filter='+  $scope.selected_filters.time_filter,
                    exchanges: urlPath+'exchanges/download?date_filter='+  $scope.selected_filters.time_filter
                };
            }
            else {
                if (typeof  $scope.campaingns !== 'undefined' && $scope.campaingns.length > 0) {
                    $scope.selectedCampaign = domainReports.getNotFound()['campaign'];
                }
            }

            if ($scope.selectedCampaign.id !== -1) {
                $scope.strategylist($scope.selectedCampaign.id);
            }
        };
       // $scope.campaignFullList={};

        $scope.campaignlist = function () {
            if(dataTransferService.getCampaignList() === false){
                domainReports.getCampaignListForUser().then(function (result) {

                    if(result.status == 'success') {
                        var campaigns = result.data.data ;
                        dataTransferService.setCampaignList('campaignList', campaigns);
                        $scope.setCampaigns(campaigns);

                    }
                });
            }else{
                $scope.setCampaigns(domainReports.getCampaignListForUser());
            }
        };

//        $scope.campaignlist = function () {
//            if(dataTransferService.getCampaignList() === false){
//                domainReports.getCampaignListForUser().then(function (result) {
//                    if(result.status == 'success' ) {
//                        $scope.campaignFullList = result.data.data;
//                        $scope.campaigns = $scope.campaignFullList.slice(0, 1000);
//                        dataTransferService.setCampaignList('campaignList', $scope.campaignFullList);
//                        $scope.setCampaigns($scope.campaigns);
//                        $scope.dataNotFound= false;
//                    }else{
//                        $scope.dataNotFound= true;
//                        //console.log('NOT FOUND');
//                    }
//                });
//            }else{
//                $scope.setCampaigns(domainReports.getCampaignListForUser());
//            }
//        };

        $scope.strategylist = function (campaignId) {
            $scope.selectedStrategy.name = "Loading...";
            viewablityService.getStrategiesForCampaign(campaignId).then(function (result) {
                $scope.strategies = result.data.data;
                if ($scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                    if(dataTransferService.getDomainReportsValue('previousCampaignId') !== dataTransferService.getDomainReportsValue('campaignId')) {
                        $scope.selectedStrategy.id = $scope.strategies[0].id;
                        $scope.selectedStrategy.name = $scope.strategies[0].name;
                    }else {
                        $scope.selectedStrategy.id =  dataTransferService.getDomainReportsValue('strategyId') ? dataTransferService.getDomainReportsValue('strategyId') : $scope.strategies[0].id;
                        $scope.selectedStrategy.name = dataTransferService.getDomainReportsValue('strategyName') ? dataTransferService.getDomainReportsValue('strategyName') :  $scope.strategies[0].name;
                    }
                    $scope.dataNotFound= false;
                    //Call the chart to load with the changed campaign id and strategyid
                     $scope.strategyViewData({campaign_id: campaignId, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
                }
                else { //  means empty strategy list
                    $scope.dataNotFound= true;
                    $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                }
            });
        };

        $scope.campaignlist();


        //Function called when the user clicks on the campaign dropdown
        $('#campaigns_list').click(function (e) {
            var id = $(e.target).attr('value'), txt = $(e.target).text();
            $scope.selectedCampaign.id = id;
            $scope.selectedCampaign.name = txt;
            $scope.selected_filters.kpi_type = $(e.target).attr('_kpi');
            $scope.selected_filters.kpi_type_text = ($(e.target).attr('_kpi') === 'action_rate') ? 'Action Rate' : $(e.target).attr('_kpi'),
            dataTransferService.updateExistingStorageObjects({
                'campaignId' : id,
                'campaignName' :  txt,
                'previousCampaignId' : dataTransferService.getDomainReportsValue('campaignId'),
                'filterKpiValue': $scope.selected_filters.kpi_type_text,
                'filterKpiType': $scope.selected_filters.kpi_type
            });
            $scope.$apply();
            if($scope.selectedCampaign.id !== -1) {
                $scope.strategylist($scope.selectedCampaign.id);
                var urlPath = apiPaths.apiSerivicesUrl+'/campaigns/'+ $scope.selectedCampaign.id +'/viewability/';
                $scope.download_urls = {
                    tactics: urlPath+'tactics/download?date_filter='+  $scope.selected_filters.time_filter,
                    domains:  urlPath+'domains/download?date_filter='+  $scope.selected_filters.time_filter,
                    publishers:  urlPath+'publishers/download?date_filter='+  $scope.selected_filters.time_filter,
                    exchanges: urlPath+'exchanges/download?date_filter='+  $scope.selected_filters.time_filter
                };
            }else{
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
            }

        });

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function() {
            //Call the chart to load with the changed campaign id and strategyid
            $scope.getStrategyList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
        };


        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');
    });

    angObj.directive('largeListSearch', function(domainReports){
        return {
            restrict: 'AE',
            scope:{
                selectedObj:"=",
                listColumns: "=",
                showSearchBtn:"="
            },
            template: '<ul class="nav navbar-nav">'+
                '<li class="dropdown" >'+
                '<div id="campaignsDropdownDiv" style="display:inline;">'+
                '<input style="width: 350px;" class="dropdown-toggle inactive dd_txt" ng-model="selectedObj.name" id="campaignDropdown" title="{{selectedObj.name}}" placeholder="{{selectedObj.name }}" />'+
                '<input type="button" value="Search" id="element" style="display: none" data-ng-click="filterDropDown()" />'+
                '<span class="sort-image-inactive" id="#campaignsDropdownDiv"></span>'+
                '</div>'+
                '<ul class="dropdown-menu" role="menu"  id="campaigns_list">'+
                '<li ng-repeat="campaign in listColumns" value="{{campaign.campaign_id}}" title="{{campaign.name}}" >{{campaign.name }}</li>'+
                '</ul>'+
                '</li>'+
                '</ul>',
            link: function ($scope, element, attrs) {

               $scope.originalCampaingList = $scope.$parent.campaigns;

                //Check the status and load the function accordingly for the campaigns list
                if(attrs.showSearchBtn === "true") {
                    $('#element').show();

                    $scope.filterDropDown = function(){
                        console.log("clicked filter drop down.");
                        var name = $scope.$parent.selectedCampaign.name.trim();
                        console.log(name);
                        if(name !== 'Loading...') {
                            var filteredOptions = [];
                            var showPreviousList=false;
                            if (name.length > 0) {

                                var searchFor = angular.lowercase(name);
                                console.log("search for " + searchFor);
                                for (var i in $scope.$parent.campaigns) {
                                    var searchIn = angular.lowercase($scope.$parent.campaigns[i].name);
                                    //Matches if the user selects from the drop down
                                    if(searchFor === searchIn) {
                                        console.log("Found exact match by selecting from dropdown")
                                        return;
                                    } else {
                                        if ((searchIn.indexOf(searchFor) >= 0)) {
                                            filteredOptions.push($scope.$parent.campaigns[i]);
                                          //  console.log(filteredOptions);
                                        }
                                    }
                                }
                                $scope.listColumns = filteredOptions;
                            }
                        }
                        if(name.length == 0){
                            $scope.listColumns =  $scope.$parent.campaigns;
                          //  $scope.campaingns = $scope.$parent.campaignFullList;
                            console.log($scope.campaingns);
                        }
                    };
                }else{
                    $scope.$watch('selectedObj.name', function(oldValue, newValue){
                        console.log(oldValue + "  "+ newValue);
                        if(oldValue === newValue) {
                            return;
                        }

                        console.log("======================");
                        console.log($scope.$parent.campaigns);
                        var name = $scope.selectedObj.name.trim();
                        if(newValue !== 'Loading...') {
                            var filteredOptions = [];
                            var showPreviousList=false;
                            if (name.length > 0) {
                                var searchFor = angular.lowercase(name);
                                for (var i in $scope.$parent.campaigns) {
                                    var searchIn = angular.lowercase($scope.$parent.campaigns[i].name);
                                    //Matches if the user selects from the drop down
                                    if(searchFor == searchIn) {
                                        return;
                                    } else {
                                        if ((searchIn.indexOf(searchFor) >= 0)) {
                                            filteredOptions.push($scope.$parent.campaigns[i]);

                                        }
                                    }
                                }
                                $scope.listColumns = filteredOptions;
                            }
                        }
                        if(name.length == 0){
                            console.log("length is zero ");
                            $scope.listColumns = $scope.originalCampaingList ;
                            // $scope.$parent.campaigns;
                            console.log($scope.listColumns);
                            //$scope.campaingns = $scope.$parent.campaignFullList;
                        }
                    });
                }


                //Function called when the user clicks on the campaign dropdown
                $('#campaigns_list').click(function (e) {
                    // $('.page_loading').css({'display': 'block'});
                    if(domainReports.checkStatus()) {
                        $scope.$parent.selectedCampaign.id = $(e.target).attr('value');
                        $scope.$parent.selectedCampaign.name = $(e.target).text();
                        $('#campaigns_list').toggle();
                        $scope.$apply();
                        $scope.$parent.strategylist($scope.$parent.selectedCampaign.id);
                    }
                });

                //Function called when the user focus on the input box
                $("#campaignDropdown").focus(function(){
                    $('#campaigns_list').css({'display' : 'block'});
                });
                //Function called when the user clicks on the down arrow icon
                $("#campaign_arrow_img").click(function(){
                    $('#campaigns_list').toggle();
                });
            }
        }
    });
}());