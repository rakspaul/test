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

        if($cookieStore.get('cdesk_session')) {
            //$scope.defaultAccountsName = loginModel.getSelectedClient()?loginModel.getSelectedClient().name:undefined;
            workflowService.getClients().then(function (result) {
                if(result && result.data.data.length >0) {
                    //(result.data.data).splice(0, 1);//remove first organization
                    loginModel.setSelectedClient({'id': result.data.data[0].id, 'name': result.data.data[0].name});

                    $scope.accountsData = [];
                    _.each(result.data.data, function (eachObj) {
                        $scope.accountsData.push({'id': eachObj.id, 'name': eachObj.name})
                    })
                    $scope.defaultAccountsName = loginModel.getSelectedClient().name ? loginModel.getSelectedClient().name : $scope.accountsData[0].name;
                    if (Number($scope.selectedCampaign) === -1) {
                        campaignSelectModel.getCampaigns(-1, {limit: 1, offset: 0}).then(function (response) {
                            $scope.selectedCampaign = response[0].campaign_id;
                        });
                    }
                }
            });
        }

        $scope.set_account_name = function(event,id,name) {
            var elem = $(event.target);
            $(".accountsList").find(".selected-li").removeClass("selected-li") ;
            elem.addClass("selected-li") ;
            loginModel.setSelectedClient({'id':id,'name':name});
            $(".accountsList").find(".dd_txt").text(name) ;
            $(".main_nav").find(".account-name-nav").text(name) ;
            $(".main_nav_dropdown").hide() ;
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
                url = '/mediaplans/'+ $scope.selectedCampaign ;
                $("#reports_overview_tab").addClass("active_tab") ;
            }
            if(event) {
                $(event.currentTarget).parent().addClass('active_tab');
            }

            $location.url(url);
        };
        
        $scope.show_hide_nav_dropdown = function(event,arg) {
          var elem = $(event.target);
          if($("#" + arg + "-menu").is(":visible") == false ) {
            $(".main_nav_dropdown").hide() ;
            $("#" + arg + "-menu").fadeIn();
            $(".main_navigation_holder").find(".selected").removeClass("selected") ;
            elem.closest("#"+ arg +"_nav_link").addClass("selected") ;
          } else {
            $(".main_nav_dropdown").fadeOut() ;
            $(".main_navigation_holder").find(".selected").removeClass("selected") ;
          }   
        } ;

        $scope.hide_navigation_dropdown = function(event) {
           var elem = $(event.target);
           setTimeout(function(){
              if(  !( $(".main_navigation_holder").is(":hover") || $("#user-menu").is(":hover") || $("#reports-menu").is(":hover") ) ) { 
                   $(".main_nav_dropdown").fadeOut() ;
                   $(".main_navigation_holder").find(".selected").removeClass("selected") ; 
               } 
          }, 1000);
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

                  if(mainNavDropdown.is(':visible') && ( $(event.target).closest("#user-menu").length == 0) && ( $(event.target).closest("#reports_nav_link").length == 0 ) && ( $(event.target).closest("#user_nav_link").length == 0 ) && ( $(event.target).closest(".header_tab_dd_subheading").length == 0 )  ) {
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
