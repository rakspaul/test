(function () {
  'use strict';
    commonModule.controller('HeaderController', function ($scope, $rootScope, $http, loginModel, $cookieStore, $location , constants, domainReports , campaignSelectModel, RoleBasedService, workflowService,advertiserModel ) {

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

        if($cookieStore.get('cdesk_session')) {
            loginModel.setClientId(2);
            var defaultClientId;
            workflowService.getClients().then(function (result) {
                defaultClientId = result.data.data[0].id;
                $scope.defaultAccountsName = result.data.data[0].name;
                $scope.accountsData = result.data.data;
                loginModel.setClientId(defaultClientId);
            });
        }

        $scope.set_account_name = function(event,id,name) {
            var elem = $(event.target);
            $(".accountsList").find(".selected-li").removeClass("selected-li") ;
            elem.addClass("selected-li") ;
            loginModel.setClientId(id) ;
            $(".accountsList").find(".dd_txt").text(name) ;
            $(".main_nav").find(".account-name-nav").text(name) ;
            $(".main_nav_dropdown").fadeIn() ;
            $(".nav-menu").hide() ;
            $("#user-menu").show();
            $rootScope.$broadcast(constants.ACCOUNT_CHANGED,id);
        };

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
        $scope.show_nav_dropdown = function(event,arg) {
          $(".main_nav_dropdown").fadeIn() ;
          $(".nav-menu").hide() ;
          $("#" + arg + "-menu").show();
          var elem = $(event.target);
          $(".main_navigation_holder").find(".selected").removeClass("selected") ;
          elem.closest("#"+ arg +"_nav_link").addClass("selected") ;
        } ;

        $scope.hide_nav_dropdown = function(event,arg) {
          if(! (  ( $(".main_nav_dropdown").is(":hover") ) || ( $("#reports_nav_link").is(":hover") ) || ( $(".profile-photo-tab").is(":hover") ) || ( $(".accountsList").is(":hover") )  ) ) {
            $(".main_nav_dropdown").fadeOut("500") ;
            $(".nav-menu").hide() ;
            var elem = $(event.target);
            $(".main_navigation_holder").find(".selected").removeClass("selected") ;
          }
          
        } ;
        $scope.logout = function() {
            loginModel.logout();
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
                    var advertisersDropDownList = $("#advertisersDropDownList");
                    var profileDropdownId = $("#profileDropdown");
                    var mainNavDropdown = $(".main_nav_dropdown");
                    var reportTypeDropdownId = $("#reportTypeDropdown");
                    var regionTooltip = $(".regionCityTab").find(".common_tooltip");
                    var quickFilters = $(".sliding_dropdown_container") ;

                  if(cdbDropdownId.is(':visible') && event.target.id != "durationMenuText") {
                      cdbDropdownId.closest(".each_filter").removeClass("filter_dropdown_open");
                      cdbDropdownId.hide();
                  }
                  if(brandsListId.is(':visible') && event.target.id != "brand_name_selected" && event.target.id != "brandsDropdown"  ) {
                      brandsListId.closest(".each_filter").removeClass("filter_dropdown_open");
                      brandsListId.hide();
                  }
                  if(advertisersDropDownList.is(':visible') && event.target.id != "advertiser_name_selected" && event.target.id != "advertisersDropdown"  ) {
                      advertisersDropDownList.closest(".each_filter").removeClass("filter_dropdown_open");
                      advertisersDropDownList.hide();
                  }

                  if(profileDropdownId.is(':visible') && event.target.id != "profileItem") {
                      profileDropdownId.hide();
                  }

                  if(mainNavDropdown.is(':visible') && event.target.id != "reports_nav_link" && event.target.id != "user_nav_link" && ( $(event.target).closest("#profileAccountData").length == 0 )  ) {
                      mainNavDropdown.hide();
                      $(".main_navigation_holder").find(".selected").removeClass("selected") ;
                  }
                  if(reportTypeDropdownId.is(':visible') && event.target.id != "reportTypeDropdownTxt") {
                      reportTypeDropdownId.hide();
                  }
                  var regionTooltipId = $(event.target).closest('li').attr("id") ;
                  if(regionTooltip.is(':visible') && regionTooltipId != "cityTab"  && event.target.id != "tab_region" ) {
                    regionTooltip.hide();
                  }

                  var quickFilterId = $(event.target).closest('.sliding_dropdown_container').attr("id");
                  if(quickFilters.is(':visible') && quickFilterId != "sliding_dropdown_container" && event.target.id != "sliding_dropdown_btn" ) {
                     $('.sliding_dropdown_container').toggle('slide', { direction: "left" }, 500);
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
