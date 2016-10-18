require.config({
    // alias libraries paths. Must set 'angular'
    waitSeconds: 0,
    urlArgs: 'v=@@BUST@@',
    paths: {
        angular:                    'libs/angular.min',
        'angular-route':            'libs/angular-route',
        angularAMD:                 'libs/angularAMD',
        jquery:                     'libs/jquery',
        'jquery-ui':                'libs/jquery-ui',
        bootstrap:                  'libs/bootstrap',
        'date-picker':              'libs/bootstrap-datepicker.min',
        'angular-resource':         'libs/angular-resource',
        'angular-switch':           'libs/angular-ui-switch.min',
        'angular-css':              'libs/angular-css',
        'angular-cookies':          'libs/angular-cookies',
        'angular-cache':            'libs/angular-cache',
        'angulartics':              'libs/angulartics.min',
        'angulartics-ga':           'libs/angulartics-google-analytics.min',
        'angular-sanitize':         'libs/angular-sanitize',
        'bootstrap-toggle':         'libs/bootstrap-toggle',
        moment:                     'libs/moment',
        'moment-tz':                'libs/moment-timezone',
        'ng-file-upload':           'libs/ng-file-upload',
        'ng-file-upload-shim':      'libs/ng-file-upload-shim',
        tmhDynamicLocale:           'libs/tmhDynamicLocale',
        'ng-infinite-scroll':       'libs/ng-infinite-scroll',
        highcharts:                 'libs/highcharts',
        'highcharts-ng':            'libs/highcharts-ng',
        'highcharts-more':          'libs/highcharts-more',
        'solid-gauge':              'libs/solid-gauge',
        underscore:                 'libs/underscore',
        'ui-bootstrap-tpls':        'libs/ui-bootstrap-tpls-0.12.1.min',
        showErrors:                 'libs/showErrors.min',
        d3:                         'libs/d3',
        lrInfiniteScroll:           'libs/lrInfiniteScroll',
        filesaver:                  'libs/FileSaver',
        multiselect:                'multi_select',
        'ng-tag':                   'libs/ng-tags-input.min',
        chosen:                     'libs/chosen',
        'modernizr-custom':        'libs/modernizr-custom',
        'dlmenu':              'libs/dlmenu',
        'populatetemplatecache' : 'populate_template_cache',

        /*register Services - Start*/
        'local-storage-service':    'common/services/local_storage_service',
        'account-service':          'common/services/account_service',
        'sub-account-service':      'common/services/sub_account_service',
        'page-finder':              'common/services/page_finder',
        'url-builder':              'common/services/url_builder',
        'data-service':             'common/services/data_service',
        'common-utils':             'common/utils',
        'url-service':              'common/services/url_service',
        'role-based-service':       'common/services/role_based_service',
        'constants-service':        'common/services/constants_service',
        'moment-utils':             'common/moment_utils',
        'features-service':        'common/services/features_service',
        'vistoconfig-service':     'common/services/vistoconfig_service',
        'route-resolvers-params-service': 'common/services/route_resolvers_params_service',
        'route-resolvers-service': 'common/services/route_resolvers_service',
        'login-service': 'login/login_service',
        'page-load-service': 'common/services/page_load_service',
        'gauge': 'reporting/common/d3/gauge',
        'audience-service': 'workflow/services/audience_service',
        'strategy-select-service': 'reporting/strategySelect/strategy_select_service',
        'screen-chart-model': 'reporting/models/screen_chart_model',
        'bubble-chart': 'reporting/common/d3/bubble_chart',
        'brands-service': 'reporting/brands/brands_service',
        'gantt-chart': 'reporting/common/d3/gantt_chart',
        'workflow-service': 'workflow/services/workflow_service',
        'request-cancel-service': 'common/services/request_cancel_service',
        'advertiser-service': 'reporting/advertiser/advertiser_service',
        'filter-service': 'workflow/services/filter_service',
        'campaign-list-service': 'reporting/campaignList/campaign_list_service',
        'transformer-service': 'common/services/transformer_service',
        'campaign-cost': 'reporting/models/campaign_cost',
        'tactic': 'reporting/models/tactic',
        'action-type': 'reporting/models/action_type',
        'activity-list': 'reporting/models/activity_list',
        'edit-actions-service': 'reporting/editActions/edit_actions_service',
        'campaign-overview-service': 'workflow/overview/campaign_overview_service',
        'video-service': 'workflow/services/video_service',
        'platform-custom-module': 'workflow/services/platform_custom_module',
        'zip-code-service': 'common/services/zip_code_service',
        'admin-account-service': 'admin/services/admin_account_service',
        'sellers-service': 'workflow/services/sellers_service',

        /*register Services - End*/

        /*register factory - Start*/

        'data-store-model': 'common/services/data_store_model',
        'brands-model': 'reporting/brands/brands_model',
        'login-model': 'login/login_model',
        'domain-reports': 'reporting/models/domain_reports',
        'advertiser-model': 'reporting/advertiser/advertiser_model',
        'strategy-select-model': 'reporting/strategySelect/strategy_select_model',
        'file-reader': 'common/services/file_reader',
        'collective-report-model': 'reporting/collectiveReport/collective_report_model',
        'campaign-select-model': 'reporting/campaignSelect/campaign_select_model',
        'time-period-model': 'reporting/timePeriod/time_period_model',
        'kpi-select-model': 'reporting/kpiSelect/kpi_select_model',
        'campaign-list-model': 'reporting/campaignList/campaign_list_model',
        'gauge-model': 'reporting/models/gauge_model',
        'bubble-chart-model': 'reporting/models/bubble_chart_model',
        'dashboard-model': 'reporting/dashboard/dashboard_model',
        'gantt-chart-model': 'reporting/models/gantt_chart_model',
        'campaign-cdb-data': 'reporting/models/campaign_cdb_data',
        'campaign-model': 'reporting/models/campaign_model',
        'charts-line': 'reporting/common/charts/line',
        'action-sub-type': 'reporting/models/action_sub_type',
        'charts-actions': 'reporting/common/charts/actions',
        'pie-chart': 'reporting/common/charts/pie_chart',
        'charts-solid-gauge': 'reporting/common/charts/solid_gauge',
        'charts-column-line': 'reporting/common/charts/column_line',
        'edit-actions-model': 'reporting/editActions/edit_actions_model',
        'reports-upload-list': 'reporting/models/reports_upload_list',
        'creative-custom-module': 'workflow/services/creative_custom_module',
        /*register factory - Start*/



        /*register Directives - Start*/
        'filter-directive':         'workflow/directives/filter_directive',
        'common-directives': 'common/directives/common_directives',
        'popup-msg': 'common/popup_msg',
        'common-directive': 'common/directive',
        'gauge-directive': 'reporting/common/d3/gauge_directive',
        'screen-chart': 'reporting/common/d3/screen_chart',
        'bar-chart': 'reporting/common/d3/bar_chart',
        'gantt-directive': 'reporting/common/d3/gantt_directive',
        'campaign-select-directive': 'reporting/campaignSelect/campaign_select_directive',
        'campaign-sort': 'reporting/directives/campaign_sort',
        'ng-upload-hidden': 'common/directives/ng_upload_hidden',
        'clear-row': 'workflow/directives/clear_row',
        'custom-date-picker': 'workflow/directives/custom_date_picker',
        'decorate-numbers': 'common/directives/decorate_numbers',
        'advertiser-directive': 'reporting/advertiser/advertiser_directive',
        'campaign-list-filter-directive': 'reporting/campaignList/campaign_list_filter_directive',
        'campaign-cost-sort': 'reporting/directives/campaign_cost_sort',
        'campaign-card': 'reporting/directives/campaign_card',
        'campaign-list-sort': 'reporting/directives/campaign_list_sort',
        'quartiles-graph': 'reporting/common/d3/quartiles_graph',
        'campaign-chart': 'reporting/common/d3/campaign_chart',
        'campaign-cost-card': 'reporting/directives/campaign_cost_card',
        'brands-directive': 'reporting/brands/brands_directive',
        'bubble-chart-directive': 'reporting/common/d3/bubble_chart_directive',
        'time-period-directive': 'reporting/timePeriod/time_period_directive',
        'sub-account-directive': 'reporting/subAccount/sub_account_directive',
        'ng-update-hidden-dropdown': 'workflow/directives/ng_update_hidden_dropdown',
        'strategy-card': 'reporting/directives/strategy_card',
        'tactic-card': 'reporting/directives/tactic_card',
        'strategy-select-directive': 'reporting/strategySelect/strategy_select_directive',
        'time-period-pick-directive': 'reporting/timePeriod/time_period_pick_directive',
        'kpi-select-directive': 'reporting/kpiSelect/kpi_select_directive',
        'edit-ad-group-section': 'workflow/directives/edit_ad_group_section',
        'creative-drop-down': 'workflow/directives/creative_drop_down',
        'directive-pie-chart': 'reporting/common/d3/pie_chart',


        /*register Directives - END*/

        /*register Controllers - Start*/
        'header-controller': 'common/controllers/header_controller',
        'popup-msg-controller': 'common/controllers/popup_msg_controller',
        'confirmation-modal-controller': 'common/controllers/confirmation_modal_controller',
        'account-change-controller': 'common/controllers/account_change_controller',
        'change-password-controller': 'reporting/common/change_password_controller',
        'gantt-chart-controller': 'reporting/controllers/gantt_chart_controller',
        'dashboard-controller': 'reporting/dashboard/dashboard_controller',
        'brands-controller': 'reporting/brands/brands_controller',
        'gauge-controller': 'reporting/controllers/gauge_controller',
        'bubble-chart-controller': 'reporting/controllers/bubble_chart_controller',
        'screen-chart-controller': 'reporting/controllers/screen_chart_controller',
        'campaign-list-controller': 'reporting/campaignList/campaign_list_controller',
        'campaign-select-controller': 'reporting/campaignSelect/campaign_select_controller',
        'advertiser-controller': 'reporting/advertiser/advertiser_controller',
        'time-period-controller': 'reporting/timePeriod/time_period_controller',
        'time-period-pick-controller': 'reporting/timePeriod/time_period_pick_controller',
        'reports-schedule-list-controller': 'reporting/collectiveReport/reports_schedule_list_controller',
        'collective-report-listing-controller': 'reporting/collectiveReport/collective_report_listing_controller',
        'campaign-create-controller': 'workflow/campaign/campaign_create_controller',
        'line-item-controller': 'workflow/campaign/line_item_controller',

        'vendors-config-list-controller': 'workflow/vendors_config/vendors_config_list_controller',
        'vendors-config-list-service': 'workflow/vendors_config/vendors_config_list_service',
        'vendor-config-controller': 'workflow/vendors_config/vendor_config_controller',
        'vendor-config-select-type-controller': 'workflow/vendors_config/vendor_config_select_type_controller',
        'vendor-config-basic-settings-controller': 'workflow/vendors_config/vendor_config_basic_settings_controller',
        'vendor-config-service': 'workflow/vendors_config/vendor_config_service',
        'vendor-config-permissions-controller': 'workflow/vendors_config/vendor_config_permissions_controller',


        'campaign-service': 'workflow/campaign/campaign_service',
        'pixels-controller': 'workflow/campaign/pixels_controller',
        'budget-controller': 'workflow/campaign/budget_controller',
        'campaign-archive-controller': 'workflow/campaign/campaign_archive_controller',
        'collective-delete-report-controller': 'reporting/collectiveReport/collective_delete_report_controller',
        'collective-edit-report-controller': 'reporting/collectiveReport/collective_edit_report_controller',
        'report-schedule-delete-controller': 'reporting/collectiveReport/report_schedule_delete_controller',
        'sub-account-controller': 'reporting/subAccount/sub_account_controller',
        'accounts-add-or-edit-advertiser-controller': 'admin/controllers/accounts_add_or_edit_advertiser_controller',
        'accounts-add-or-edit-brand-controller': 'admin/controllers/accounts_add_or_edit_brand_controller',
        'accounts-add-or-edit-controller': 'admin/controllers/accounts_add_or_edit_controller',
        'account-list-dropdown-controller': 'admin/controllers/account_list_dropdown_controller',
        'users-add-or-edit-controller': 'common/controllers/users/users_add_or_edit_controller',
        'reports-invoice-addNote-controller': 'reporting/collectiveReport/reports_invoice_addNote_controller',
        'reports-invoice-addAdjustment-controller': 'reporting/collectiveReport/reports_invoice_addAdjustment_controller',
        'invoice-upload-SOR-controller': 'reporting/collectiveReport/invoice_upload_SOR_controller',
        'actions-controller': 'reporting/controllers/actions_controller',
        'edit-actions-controller': 'reporting/editActions/edit_actions_controller',
        'kpi-select-controller': 'reporting/kpiSelect/kpi_select_controller',
        'strategy-select-controller': 'reporting/strategySelect/strategy_select_controller',
        'get-adgroups-controller': 'workflow/overview/get_adgroups_controller',
        'campaign-clone-controller': 'workflow/overview/campaign_clone_controller',
        'budget-delivery-controller': 'workflow/ad/budget_delivery_controller',
        'buying-platform-controller': 'workflow/ad/buying_platform_controller',
        'targetting-controller': 'workflow/ad/targetting_controller',
        'geo-targetting-controller': 'workflow/ad/geo_targetting_controller',
        'audience-targetting-controller': 'workflow/ad/audience_targetting_controller',
        'daypart-create-controller': 'workflow/ad/daypart_create_controller',
        'video-targetting-controller': 'workflow/ad/video_targetting_controller',
        'inventory-filters-controller': 'workflow/ad/inventory_filters_controller',
        'creative-controller': 'workflow/creative/creative_controller',
        'creative-list-controller': 'workflow/creative/creative_list_controller',
        'creative-tag-controller': 'workflow/creative/creative_tag_controller',
        'ad-clone-controller': 'workflow/ad/ad_clone_controller',
        'direct-Inventory-controller': 'workflow/ad/direct_Inventory_controller',
        'login-controller': 'login/login_controller',
        'tag-preview-controller': 'workflow/creative/tag_preview_controller',
        'campaign-reports-controller': 'reporting/controllers/campaign_reports_controller',
        'campaign-details-controller': 'reporting/controllers/campaign_details_controller',
        'performance-controller': 'reporting/controllers/performance_controller',
        'cost-controller': 'reporting/controllers/cost_controller',
        'platform-controller': 'reporting/controllers/platform_controller',
        'inventory-controller': 'reporting/controllers/inventory_controller',
        'viewability-controller': 'reporting/controllers/viewability_controller',
        'optimization-controller': 'reporting/controllers/optimization_controller',
        'custom-report-controller': 'reporting/controllers/custom_report_controller',
        'custom-report-upload-controller': 'reporting/controllers/custom_report_upload_controller',
        'reports-invoice-list-controller': 'reporting/collectiveReport/reports_invoice_list_controller',
        'reports-invoice-controller': 'reporting/collectiveReport/reports_invoice_controller',
        'accounts-controller': 'admin/controllers/accounts_controller',
        'users-controller': 'common/controllers/users/users_controller',
        'admin-brands-controller': 'admin/controllers/admin_brands_controller',
        'admin-advertisers-controller': 'admin/controllers/admin_advertisers_controller',
        'campaign-overview-controller': 'workflow/overview/campaign_overview_controller',
        'ad-create-controller': 'workflow/ad/ad_create_controller',
        'creative-preview-controller': 'workflow/creative/creative_preview_controller',
        'creative-bulk-controller': 'workflow/creative/creative_bulk_controller',
        'audit-controller': 'admin/controllers/entity_audit_controller',
        'seller-targetting-controller' : 'workflow/ad/seller_targetting_controller',

        /*register Controllers - Start*/

        /*register Filters - Start*/
        'common-filter': 'common/filter'
        /*register Filters - End*/

    },

    // Add angular modules that does not support AMD out of the box, put it in a shim
    shim: {
        jquery:                {exports: 'jquery'},
        'jquery-ui':           {deps: ['jquery']},
        bootstrap:             ['jquery'],
        'angular':             {deps: ['bootstrap'], exports: 'angular'},
        angularAMD:            ['angular'],
        'angular-route':       ['angular-resource'],
        'angular-resource':    ['angular'],
        'angular-switch':      ['angular'],
        'angular-cookies':     ['angular'],
        'angular-cache':       ['angular'],
        'angulartics':         ['angular'],
        'angulartics-ga':      ['angulartics'],
        'date-picker':         ['jquery', 'jquery-ui', 'bootstrap', 'angular'],
        'ng-file-upload-shim': [],
        'ng-file-upload':      ['angular'],
        tmhDynamicLocale:      ['angular'],
        'ng-infinite-scroll':  ['angular-route'],
        'highcharts-ng':       ['ng-infinite-scroll'],
        highcharts:            ['highcharts-ng'],
        'highcharts-more':     ['highcharts'],
        chosen:                ['jquery'],
        'solid-gauge':         ['highcharts-more'],
        underscore:            ['angular'],
        d3:                    ['angulartics-ga'],
        'angular-sanitize':    ['d3'],
        filesaver:             ['angular-sanitize'],
        'ui-bootstrap-tpls':   ['filesaver'],
        lrInfiniteScroll:      ['ui-bootstrap-tpls'],
        'angular-css':         ['angular'],
        multiselect:           ['angular'],
        'bootstrap-toggle':    ['jquery'],
        showErrors:            ['angular'],
        'ng-tag':              ['angular'],
        populatetemplatecache: ['angular']
    },

    priority: ['angular'],

    // kick start application
    deps: ['app']
});
