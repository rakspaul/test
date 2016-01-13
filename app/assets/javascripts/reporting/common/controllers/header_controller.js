(function () {
  'use strict';
    commonModule.controller('HeaderController', function ($scope, $rootScope, $http, loginModel, $timeout, $route, $modal, $cookieStore, $location , constants, domainReports , campaignSelectModel, RoleBasedService, workflowService,advertiserModel, tmhDynamicLocale ) {

        $scope.user_name = loginModel.getUserName();
        $scope.version = version;
        $scope.filters = domainReports.getReportsTabs();
        $scope.customFilters = domainReports.getCustomReportsTabs();
        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign().id;

        if($cookieStore.get('cdesk_session')) {
            workflowService.getClients().then(function (result) {
                if (result && result.data.data.length > 0) {
                    if(!loginModel.getSelectedClient() && loginModel.getSelectedClient().name) {
                        $scope.result.data.data[0].children = _.sortBy(result.data.data[0].children);
                        loginModel.setSelectedClient({
                            'id': result.data.data[0].children[0].id,
                            'name': result.data.data[0].children[0].name
                        });
                    }
                    $scope.accountsData = [];
                    _.each(result.data.data, function (org) {
                        if(org.children.length > 1) {
                            $scope.multipleClient = true;
                            _.each(org.children, function (eachObj) {
                                $scope.accountsData.push({'id': eachObj.id, 'name': eachObj.name})
                            })
                        } else {
                            $scope.multipleClient = false;
                        }
                    })

                    $scope.accountsData = _.sortBy($scope.accountsData, 'name');

                    if(loginModel.getSelectedClient() && loginModel.getSelectedClient().name) {
                        $scope.defaultAccountsName = loginModel.getSelectedClient().name;
                    } else {
                        $scope.defaultAccountsName = $scope.accountsData[0].name;
                    }

                    if (Number($scope.selectedCampaign) === -1) {
                        campaignSelectModel.getCampaigns(-1, {limit: 1, offset: 0}).then(function (response) {
                            if(response.length >0) {
                                $scope.selectedCampaign = response[0].campaign_id;
                            }
                        });
                    }

                    var clientId;
                    if(loginModel.getSelectedClient() && loginModel.getSelectedClient().id ) {
                        clientId = loginModel.getSelectedClient().id;
                    } else {
                        clientId = $scope.accountsData[0].id;
                    }
                    $scope.getClientData(clientId);
                   //$rootScope.$broadcast(constants.ACCOUNT_CHANGED, clientId);
                }
            });
        }

        $scope.getClientData = function(clientId) {
            workflowService.getClientData(clientId).then(function (response) {
                RoleBasedService.setClientRole(response);//set the type of user here in RoleBasedService.js
                RoleBasedService.setCurrency();
            });
        }

        var showSelectedClient = function(evt, clientName) {
            var elem = $(evt.target);
            $(".accountsList").find(".selected-li").removeClass("selected-li") ;
            elem.addClass("selected-li") ;
            $(".accountsList").find(".dd_txt").text(clientName) ;
            $(".main_nav").find(".account-name-nav").text(clientName) ;
            $(".main_nav_dropdown").hide() ;
            $("#user-menu").show();
        }

        $scope.set_account_name = function(event,id,name) {
            var moduleObj = workflowService.getModuleInfo();
            if(moduleObj && moduleObj.moduleName === 'WORKFLOW') {
                if(loginModel.getSelectedClient().id !== id) {
                    var $modalInstance = $modal.open({
                        templateUrl: assets.html_change_account_warning,
                        controller: "AccountChangeController",
                        scope: $scope,
                        windowClass: 'delete-dialog',
                        resolve: {
                            headerMsg: function () {
                                return constants.accountChangeHeader;
                            },
                            mainMsg: function () {
                                return moduleObj.warningMsg;
                            },
                            accountChangeAction: function () {
                                return function () {
                                    loginModel.setSelectedClient({'id': id, 'name': name});
                                    showSelectedClient(event, name);
                                    $rootScope.clientName = name;
                                    if(moduleObj.redirect) {
                                        $location.url('/mediaplans');
                                    } else {
                                        $route.reload();
                                    }
                                }
                            }
                        }
                    });
                }
            } else {
                loginModel.setSelectedClient({'id': id, 'name': name});
                showSelectedClient(event, name);
                $scope.getClientData(id);
                $rootScope.clientName = name;
                $rootScope.$broadcast(constants.ACCOUNT_CHANGED, {'client' : id, 'event_type' :'clicked'});
            }


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
                if($scope.selectedCampaign === -1) {
                    url = '/mediaplans';
                } else {
                    url = '/mediaplans/'+ $scope.selectedCampaign ;
                    $("#reports_overview_tab").addClass("active_tab") ;
                }
            }
            if(event) {
                $(event.currentTarget).parent().addClass('active_tab');
            }

            $location.url(url);
        };
        
        $scope.show_hide_nav_dropdown = function(event,arg,behaviour) {
          var elem = $(event.target);
          if($("#" + arg + "-menu").is(":visible") == false ) {
            $(".main_nav_dropdown").hide() ;
            $("#" + arg + "-menu").fadeIn();
            $(".main_navigation_holder").find(".selected").removeClass("selected") ;
            elem.closest("#"+ arg +"_nav_link").addClass("selected") ;
          } else {
            if(behaviour == "click") {
               // $(".main_nav_dropdown").fadeOut() ;
                $(".main_navigation_holder").find(".selected").addClass("selected") ;
            }
          }   
          
        } ;

        $scope.hide_navigation_dropdown = function(event) {
           var elem = $(event.target);
           setTimeout(function(){
              if(  !( $(".main_navigation_holder").is(":hover") || $("#user-menu").is(":hover") || $("#reports-menu").is(":hover") ) ) { 
                   $(".main_nav_dropdown").fadeOut() ;
                   $(".main_navigation_holder").find(".selected").removeClass("selected") ; 
               } 
          }, 1500);
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
        //$rootScope.dashboard = {};
        //$rootScope.dashboard.isNetworkUser = loginModel.getIsNetworkUser();

        $(function() {
            var closeMenuPopUs = function(event) {
                var e = event.target || event.srcElement,
                    cdbDropdownId = $("#cdbDropdown"),
                    brandsListId = $("#brandsList"),
                    advertisersDropDownList = $("#advertisersDropDownList"),
                    profileDropdownId = $("#profileDropdown"),
                    campObjId = $("#campObj"),
                    mainNavDropdown = $(".main_nav_dropdown"),
                    reportTypeDropdownId = $("#reportTypeDropdown"),
                    regionTooltip = $(".regionCityTab").find(".common_tooltip"),
                    quickFilters = $(".sliding_dropdown_container");
                // if($(e).closest(".report_builder_container").length) {
                //     var dropdownMenu = $(".left_border .dropdown .dropdown-menu");
                //     dropdownMenu.css("display", "none");
                //     if ($(e).closest(".dropdown").length && $(e).closest(".left_border").length) {
                //         var attr = $(e).attr('ng-click'),
                //             attr = (typeof attr == "undefined" || attr == null) ? false : attr;
                //         if ((attr && attr.search("addSearch") != -1) || $(e).attr("class") == "arrow_img" || $(e).attr("class") == "dd_txt ng-binding") {
                //             dropdownMenu.css("display", "block");
                //         }
                //     }
                // }
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
                if(campObjId.is(':visible') && ( $(event.target).closest("#campObjClick").length == 0) ) {
                    campObjId.hide();
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
