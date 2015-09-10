(function () {
  'use strict';
    commonModule.controller('headerController', function ($scope, $rootScope, $http, loginModel, $cookieStore, $location , domainReports , campaignSelectModel ,RoleBasedService) {

        $scope.user_name = loginModel.getUserName();
        $scope.version = version;
        $scope.filters = domainReports.getReportsTabs();
        $scope.customFilters = domainReports.getCustomReportsTabs();
        $scope.isNetworkUser = loginModel.getIsNetworkUser();
        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign().id;

        if(RoleBasedService.getUserRole()) {
            $scope.isWorkFlowUser = RoleBasedService.getUserRole().workFlowUser;
        }

        if($cookieStore.get('cdesk_session') && Number($scope.selectedCampaign) === -1) {
            campaignSelectModel.getCampaigns(-1, {limit: 1, offset: 0}).then(function (response) {
                $scope.selectedCampaign = response[0].campaign_id;
            });
        }

        $scope.showProfileMenu = function() {
            $("#profileDropdown").toggle();
            $("#brandsList").hide();
            $(".page_filters").find(".filter_dropdown_open").removeClass("filter_dropdown_open");
            $("#cdbDropdown").hide();
        };

        $scope.NavigateToTab =  function(url, event, page) {
            $(".header_tab_dropdown").removeClass('active_tab');
            if(page === 'reportOverview') {
                $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign().id ;
                url = '/campaigns/'+ $scope.selectedCampaign ;
                $("#reports_overview_tab").addClass("active_tab") ;
            }
            if(event) {
                $(event.currentTarget).parent().addClass('active_tab');
            }

            $location.url(url);
        };

        $scope.removeUserData = function() {
            $cookieStore.remove('cdesk_session');
            $http.defaults.headers.common.Authorization = '';
            localStorage.clear();
            loginModel.deleteData();
        };

        $scope.logout = function() {
            $scope.removeUserData();
            $location.url('/login');
        };

        $scope.setDefaultReport = function(reportTitle){
            $(".header_tab_dropdown").removeClass('active_tab');
            $( "a[reportTitle='"+reportTitle+"']").parent().addClass('active_tab')
        }

        var callSetDefaultReport = $rootScope.$on("callSetDefaultReport",function(event,args){
            $scope.setDefaultReport(args);
        });
        $rootScope.dashboard = {};
        $rootScope.dashboard.isNetworkUser = loginModel.getIsNetworkUser();

        $(function() {
            var closeMenuPopUs = function(event) {
                    var cdbDropdownId = $("#cdbDropdown");
                    var brandsListId = $("#brandsList");
                    var profileDropdownId = $("#profileDropdown");
                    var reportTypeDropdownId = $("#reportTypeDropdown");
                    var regionTooltip = $(".regionCityTab").find(".common_tooltip");
                  if(cdbDropdownId.is(':visible') && event.target.id != "durationMenuText") {
                      cdbDropdownId.closest(".each_filter").removeClass("filter_dropdown_open");
                      cdbDropdownId.hide();
                  }
                  if(brandsListId.is(':visible') && event.target.id != "brand_name_selected" && event.target.id != "brandsDropdown"  ) {
                      brandsListId.closest(".each_filter").removeClass("filter_dropdown_open");
                      brandsListId.hide();
                  }
                  if(profileDropdownId.is(':visible') && event.target.id != "profileItem") {
                      profileDropdownId.hide();
                  }
                  if(reportTypeDropdownId.is(':visible') && event.target.id != "reportTypeDropdownTxt") {
                      reportTypeDropdownId.hide();
                  }
                  if(regionTooltip.is(':visible') && event.target.id != "cityTab") {
                      regionTooltip.hide();
                  }
              }

              $( document ).click(function(event) {
                  closeMenuPopUs(event);
              });

              $(document).on('click', ".dropdown_ul_text ", function (event) {
                  var campaignDropdownId = $("#campaignDropdown");
                  var campaignsListId = $("#campaigns_list");
                  closeMenuPopUs(event);
                  if(event.target.id == 'performance_download_btn') {
                      if(campaignDropdownId.is(':visible')) {
                          campaignsListId.hide();
                      }
                  }

                  if(event.target.id == 'strategy_dropdown') {
                      if(campaignDropdownId.is(':visible')) {
                          campaignsListId.hide();
                      }
                  }

              });

        })

    });
}());
