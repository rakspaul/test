define(['angularAMD', 'common/services/constants_service', 'login/login_model',
    'reporting/models/domain_reports', 'reporting/campaignSelect/campaign_select_model',
    'common/services/role_based_service', 'workflow/services/workflow_service', 'common/services/features_service',
    'reporting/subAccount/sub_account_service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('HeaderController', function ($scope, $rootScope, $route, $cookieStore, $location, $modal,
                                                        constants, loginModel, domainReports, campaignSelectModel,
                                                        RoleBasedService, workflowService, featuresService,
                                                        subAccountModel, localStorageService) {
        
        var featurePermission = function () {
                $scope.fparams = featuresService.getFeatureParams();
                $scope.showMediaPlanTab = $scope.fparams[0].mediaplan_list;
                $scope.showReportTab = $scope.fparams[0].reports_tab;
            },

            showSelectedMasterClient = function (evt, clientName) {
                var elem = $(evt.target);

                $('.accountsList-dropdown-li').find('.selected-li').removeClass('selected-li');
                elem.addClass('selected-li');
                $('.accountsList').find('.dd_txt').text(clientName);
                $('.main_nav').find('.account-name-nav').text(clientName);
                $('.main_nav_dropdown').hide();
                $('#user-menu').show();
            },

            setMasterClientData = function (id, name, isLeafNode, event) {
                localStorageService.masterClient.set({
                    id: id,
                    name: name,
                    isLeafNode: isLeafNode
                });

                showSelectedMasterClient(event, name);

                if (isLeafNode) {
                    loginModel.setSelectedClient({
                        id: id,
                        name: name
                    });

                    $scope.getClientData();

                    $rootScope.$broadcast(constants.ACCOUNT_CHANGED, {
                        client: loginModel.getSelectedClient().id,
                        event_type: 'clicked'
                    });
                } else {
                    subAccountModel.fetchSubAccounts('MasterClientChanged', function () {
                        $scope.getClientData();

                        $rootScope.$broadcast(constants.EVENT_MASTER_CLIENT_CHANGED, {
                            client: loginModel.getSelectedClient().id,
                            event_type: 'clicked'
                        });
                    });
                }

                $scope.defaultAccountsName = name;
            };

        $scope.user_name = loginModel.getUserName();
        $scope.version = version;
        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign().id;
        $scope.reports_nav_url = '' ;

        if ($scope.selectedCampaign === -1) {
            $scope.reports_nav_url = '/mediaplans';
        } else {
            $scope.reports_nav_url = '/mediaplans/' + $scope.selectedCampaign;
        }

        $scope.reports_nav_url = '' ;
        if ($scope.selectedCampaign === -1) {
            $scope.reports_nav_url = '/mediaplans';
        } else {
            $scope.reports_nav_url = '/mediaplans/' + $scope.selectedCampaign;
        }
        $scope.getClientData = function () {
            var clientId = localStorageService.masterClient.get().id;

            workflowService
                .getClientData(clientId)
                .then(function (response) {
                    // set the type of user here in RoleBasedService.js
                    RoleBasedService.setClientRole(response);
                    RoleBasedService.setCurrencySymbol();
                    featuresService.setFeatureParams(response.data.data.features, 'headercontroller');
                    $scope.filters = domainReports.getReportsTabs();
                    $scope.customFilters = domainReports.getCustomReportsTabs();
                });
        };

        $scope.set_account_name = function (event, id, name, isLeafNode) {
            var moduleObj = workflowService.getModuleInfo(),
                $modalInstance;

            if (moduleObj && moduleObj.moduleName === 'WORKFLOW') {
                if (localStorageService.masterClient.get().id !== id) {
                    $modalInstance = $modal.open({
                        templateUrl: assets.html_change_account_warning,
                        controller: 'AccountChangeController',
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
                                    setMasterClientData(id, name,isLeafNode, event);

                                    if (!localStorageService.masterClient.get().isLeafNode) {
                                       subAccountModel.resetDashboardSubAccStorage();
                                    }

                                    // TODO: check this condition ...
                                    // when enters as workflow user should we broadcast masterclient - sapna
                                    if (moduleObj.redirect) {
                                        $location.url('/mediaplans');
                                    } else {
                                        $route.reload();
                                    }
                                };
                            }
                        }
                    });
                }
            } else {
                setMasterClientData(id, name,isLeafNode, event);

                if (!localStorageService.masterClient.get().isLeafNode) {
                    subAccountModel.resetDashboardSubAccStorage();
                }
            }
        };

        $scope.showProfileMenu = function () {
            $('#profileDropdown').toggle();
            $('#brandsList').hide();
            $('.page_filters').find('.filter_dropdown_open').removeClass('filter_dropdown_open');
            $('#cdbDropdown').hide();
        };

        $scope.NavigateToTab = function (url, event, page) {
            $('.header_tab_dropdown').removeClass('active_tab active selected');

            if (page === 'reportOverview') {
                $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign().id;

                if ($scope.selectedCampaign === -1) {
                    url = '/mediaplans';
                    $('.each_nav_link').removeClass('active_tab active selected');
                    $('.reports_sub_menu_dd_holder').find('.active_tab').removeClass('active_tab');
                    $('#campaigns_nav_link').addClass('active_tab');
                } else {
                    url = '/mediaplans/' + $scope.selectedCampaign;
                    $('.each_nav_link').removeClass('active_tab active selected');
                    $('#reports_overview_tab').addClass('active_tab');
                    $('#reports_nav_link').addClass('active_tab');
                }
            } else if (page === 'creativelist') {
                $('.each_nav_link').removeClass('active_tab active selected');
                url = '/creative/list';
                $('#creative_nav_link').addClass('active_tab');
            } else if (page === 'adminOverview') {
                $('.each_nav_link').removeClass('active_tab active selected');
                url = '/admin/accounts';
                $('#admin_nav_link').addClass('active_tab');
            } else if (page === 'mediaplanList') {
                $('.each_nav_link').removeClass('active_tab active selected');
                url = '/mediaplans';
                $('#campaigns_nav_link').addClass('active_tab');
            } else if (page === 'vendorsList') {
                $('.each_nav_link').removeClass('active_tab active selected');
                url = '/vendors/list';
                $('#vendors_nav_link').addClass('active_tab');
            } else if (page === 'reportsSubPage') {
                $('.reports_sub_menu_dd_holder').find('.active_tab').removeClass('active_tab');
                $('.each_nav_link').removeClass('active_tab active selected');
                $('#reports_nav_link').addClass('active_tab');
                $(event.currentTarget).parent().addClass('active_tab');
            }
            $location.url(url);
        };

        $scope.show_hide_nav_dropdown = function (event, arg, behaviour) {
            var elem = $(event.target),
                minHeight,
                argMenu = $('#' + arg + '-menu');

            if (argMenu.is(':visible') === false) {
                $('.main_nav_dropdown').hide();
                minHeight = argMenu.css('min-height');
                argMenu.css('min-height', 0).slideDown('fast', function () {
                    $(this).css('min-height', minHeight);
                });
                $('.main_navigation_holder').find('.selected').removeClass('selected');
                elem.closest('#' + arg + '_nav_link').addClass('selected');
                $('.each_nav_link.active .arrowSelect').hide();
            } else {
                if (behaviour === 'click') {
                    $('.main_navigation_holder').find('.selected').addClass('selected');
                }
            }
        };

        $scope.hide_navigation_dropdown = function () {
            var mainMenuHolder = $('.main_navigation_holder');

            setTimeout(function () {
                $('.each_nav_link.active .arrowSelect').fadeIn();
            }, 400);

            setTimeout(function () {
                if (!(mainMenuHolder.is(':hover') ||
                    $('#help-menu').is(':hover') ||
                    $('#user-menu').is(':hover') ||
                    $('#reports-menu').is(':hover') ||
                    $('#admin-menu').is(':hover')) ||
                    $('#campaigns_nav_link').is(':hover')) {
                    $('#reports-menu, #admin-menu, #user-menu, #help-menu').css('min-height',0).slideUp('fast');
                    mainMenuHolder.find('.selected').removeClass('selected');
                }
            }, 400);
        };

        $scope.logout = function () {
            loginModel.logout();
        };

        $scope.setDefaultReport = function (reportTitle) {
            $('.header_tab_dropdown').removeClass('active_tab');
            $('a[reportTitle="' + reportTitle + '"]').parent().addClass('active_tab');
        };

        $rootScope.$on('callSetDefaultReport', function (event, args) {
            $scope.setDefaultReport(args);
        });

        if ($cookieStore.get('cdesk_session')) {
            workflowService
                .getClients()
                .then(function (result) {
                    var preferredClient,
                        campaignsClientData;

                    if (result && result.data.data.length > 0) {
                        preferredClient = RoleBasedService.getUserData().preferred_client;

                        campaignsClientData = function () {
                            if (Number($scope.selectedCampaign) === -1) {
                                campaignSelectModel
                                    .getCampaigns(-1, {limit: 1, offset: 0})
                                    .then(function (response) {
                                        var firstCampaign;

                                        if (response.length > 0) {
                                            $scope.selectedCampaign = response[0].campaign_id;

                                            firstCampaign = {
                                                id: response[0].campaign_id,
                                                name: response[0].name,
                                                startDate: response[0].start_date,
                                                endDate: response[0].end_date,
                                                kpi: response[0].kpi_type,
                                                redirectWidget: ''
                                            };

                                            localStorageService.selectedCampaign.set(firstCampaign);
                                        }
                                    });
                            }

                            $scope.getClientData();
                        };

                        $scope.accountsData = [];

                        _.each(result.data.data, function (org) {
                            $scope.accountsData.push({
                                id: org.id,
                                name: org.name,
                                isLeafNode: org.isLeafNode
                            });

                            if (preferredClient !== undefined &&
                                org.id === preferredClient &&
                                !localStorageService.masterClient.get()) {
                                localStorageService.masterClient.set(org.id, org.name, org.isLeafNode);
                            }
                        });

                        if (preferredClient === 0 && !localStorageService.masterClient.get()) {
                            localStorageService
                                .masterClient
                                .set(result.data.data[0].id, result.data.data[0].name, result.data.data[0].isLeafNode);
                        }

                        if (result.data.data.length > 1) {
                            $scope.multipleClient = true;
                        } else {
                            $scope.multipleClient = false;
                        }

                        $scope.accountsData = _.sortBy($scope.accountsData, 'name');

                        if (localStorageService.masterClient.get() && localStorageService.masterClient.get().name) {
                            $scope.defaultAccountsName = localStorageService.masterClient.get().name;
                        } else {
                            $scope.defaultAccountsName = $scope.accountsData[0].name;
                        }

                        if (angular.isUndefined(loginModel.getSelectedClient()) ||
                            loginModel.getSelectedClient() === null) {
                            if (localStorageService.masterClient.get().isLeafNode) {
                                loginModel.setSelectedClient({
                                    id: localStorageService.masterClient.get().id,
                                    name: localStorageService.masterClient.get().name
                                });

                                campaignsClientData(1);
                            } else {
                                subAccountModel.fetchSubAccounts('headerCtrl',function () {
                                    campaignsClientData(2);
                                });
                            }
                        } else {
                            campaignsClientData(3);
                        }
                    }
                });
        }

        // Start Feature Permission
        $rootScope.$on('features', function () {
            featurePermission();
            $scope.isSuperAdmin = loginModel.getClientData().is_super_admin;
        });

        featurePermission();
        // End Feature Permission

        $(function () {
            var closeMenuPopUs = function (event) {
                var cdbDropdownId = $('#cdbDropdown'),
                    brandsListId = $('#brandsList'),
                    advertisersDropDownList = $('#advertisersDropDownList'),
                    dropdownMenuWithSearch = $('.dropdown-menu-with-search'),
                    subAccountDropDownList = $('#subAccountDropDownList'),
                    profileDropdownId = $('#profileDropdown'),
                    accountDropdownList = $('.clientDropdownCnt'),
                    campObjId = $('#campObj'),
                    mainNavDropdown = $('.main_nav_dropdown'),
                    reportTypeDropdownClass = $('.reportTypeDropdown'),
                    campaigns_list_class = $('.campaigns_list'),
                    regionTooltip = $('.regionCityTab').find('.common_tooltip'),
                    quickFilters = $('.sliding_dropdown_container'),
                    dropdownWithSearch = $('.clone-ad-popup .dropdown-search'),
                    geoTooltipClose = $('.targetting-tab-header').find('.common_tooltip'),
                    childTier = $('.childTier'),
                    quickFilterId,
                    regionTooltipId;

                if (cdbDropdownId.is(':visible') && ($(event.target).hasClass('durationMenuText') === false) ) {
                    cdbDropdownId.closest('.each_filter').removeClass('filter_dropdown_open');
                    cdbDropdownId.hide();
                }

                if (brandsListId.is(':visible') &&
                    event.target.id !== 'brand_name_selected' &&
                    event.target.id !== 'brandsDropdown') {
                    brandsListId.closest('.each_filter').removeClass('filter_dropdown_open');
                    brandsListId.hide();
                }

                if (advertisersDropDownList.is(':visible') &&
                    event.target.id !== 'advertiser_name_selected' &&
                    event.target.id !== 'advertisersDropdown') {
                    advertisersDropDownList.closest('.each_filter').removeClass('filter_dropdown_open');
                    advertisersDropDownList.hide();
                }

                if (dropdownMenuWithSearch.is(':visible') &&
                    ($(event.target).closest('.dropdown').find('.dropdown-with-search-btn').length === 0) &&
                    ($(event.target).closest('.dropdown').find('.search-inside-dropdown').length === 0)) {
                    dropdownMenuWithSearch.hide();
                }

                if (subAccountDropDownList.is(':visible') &&
                    event.target.id !== 'sub_account_name_selected' &&
                    event.target.id !== 'subAccountDropdown') {
                    subAccountDropDownList.closest('.each_filter').removeClass('filter_dropdown_open');
                    subAccountDropDownList.hide();
                }

                if (profileDropdownId.is(':visible') && event.target.id !== 'profileItem') {
                    profileDropdownId.hide();
                }

                if (dropdownWithSearch.is(':visible') &&  ($(event.target).closest('.toggleDropdown').length === 0)) {
                    dropdownWithSearch.hide();
                }

                if (geoTooltipClose.is(':visible') &&
                    $(event.target).closest('.targetting-tab-header .btn-group').length === 0) {
                    geoTooltipClose.hide();
                }

                if (campObjId.is(':visible') && ($(event.target).closest('#campObjClick').length === 0)) {
                    campObjId.hide();
                }

                if (mainNavDropdown.is(':visible') &&
                    ($(event.target).closest('#user-menu').length === 0) &&
                    ($(event.target).closest('#reports_nav_link').length === 0) &&
                    ($(event.target).closest('#user_nav_link').length === 0) &&
                    ($(event.target).closest('.header_tab_dd_subheading').length === 0)) {
                    mainNavDropdown.hide();
                    $('.main_navigation_holder').find('.selected').removeClass('selected');
                }

                if (reportTypeDropdownClass.is(':visible') &&
                    ($(event.target).closest('.reportTypeDropdownTxt').length === 0)) {
                    reportTypeDropdownClass.hide();
                }

                if (campaigns_list_class.is(':visible') &&
                    ($(event.target).closest('.campaign_name_selected').length === 0) &&
                    ($(event.target).closest('#campaignsDropdownDiv').length === 0)) {
                    campaigns_list_class.hide();
                }

                if (accountDropdownList.is(':visible') &&
                    ($(event.target).closest('.clientDropdownCnt').length === 0) &&
                    ($(event.target).closest('.accountDropDown').length === 0) &&
                    !$(event.target).parents('div[id^=accountDropDown]').length) {
                    accountDropdownList.hide();
                    childTier.hide();
                }

                // In  admin users page, the multidimensional (for nth dimension dropdown) account dropdown
                // closes on click of body
                if (childTier.is(':visible') &&
                    ($(event.target).closest('.clientDropdownCnt').length === 0) &&
                    ($(event.target).closest('.accountDropDown').length === 0)) {
                    childTier.hide();
                }

                regionTooltipId = $(event.target).closest('li').attr('id');

                if (regionTooltip.is(':visible') && regionTooltipId !== 'cityTab' && event.target.id !== 'tab_region') {
                    regionTooltip.hide();
                }

                quickFilterId = $(event.target).closest('.sliding_dropdown_container').attr('id');
                if (quickFilters.is(':visible') &&
                    quickFilterId !== 'sliding_dropdown_container' &&
                    event.target.id !== 'sliding_dropdown_btn') {
                    quickFilters.toggle('slide', {direction: 'left'}, 500);
                }
            };

            $(document).click(function (event) {
                closeMenuPopUs(event);
            });

            $(document).on('click', '.dropdown_ul_text', function (event) {
                var campaignDropdownId = $('#campaignDropdown'),
                    campaignsListId = $('#campaigns_list');

                closeMenuPopUs(event);

                if (event.target.id === 'performance_download_btn') {
                    if (campaignDropdownId.is(':visible')) {
                        campaignsListId.hide();
                    }
                }

                if (event.target.id === 'strategy_dropdown') {
                    if (campaignDropdownId.is(':visible')) {
                        campaignsListId.hide();
                    }
                }
            });

            // Mobile Menu
            $scope.mobileMenuShow = function () {
                var winHeightMaster = $('.bodyWrap').height(),
                    mobileHideFunc = $('.mobileHideFunc'),
                    winWidthMaster = $('body').width();

                $('.mobileNavWrap, .mobileNav').css('height', winHeightMaster - 50);

                mobileHideFunc.css({
                    height: winHeightMaster,
                    width: winWidthMaster - 200
                });

                $('.mobileNavWrap').show();
                mobileHideFunc.fadeIn();
                $('.mobileNav').show('slide', {direction: 'left'}, 300);

                $('.icon-hamburger').css({
                    '-ms-transform': 'rotate(90deg)',
                    '-webkit-transform': 'rotate(90deg)',
                    transform: 'rotate(90deg)'
                });
            };

            $scope.mobileMenuHide = function () {
                $('.mobileNavWrap').hide();

                $('.icon-hamburger').css({
                    '-ms-transform': 'rotate(0deg)',
                    '-webkit-transform': 'rotate(0deg)',
                    transform: 'rotate(0deg)'
                });
            };
        });
    });
});
