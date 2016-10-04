var IMAGES_PATH = '/images/',
    IMAGES_STATUS_WIDGET_PATH = IMAGES_PATH + 'statusWidget/',
    IMAGES_STATUS_BULBS_PATH = IMAGES_PATH + 'statusBulbs/',
    IMAGES_CDESK_PATH = IMAGES_PATH + 'cdesk/',
    IMAGES_CALENDAR_PATH = IMAGES_PATH + 'calendar/',
    STYLESHEETS_PATH = '/styles/',
    assets = {}; // jshint ignore:line

assets.platform_icon = IMAGES_PATH + 'tag_icon.png';

assets.ontrack = IMAGES_STATUS_WIDGET_PATH + 'on_track_icon.png';
assets.underperforming = IMAGES_STATUS_WIDGET_PATH + 'underperforming_icon.png';
assets.paused = IMAGES_STATUS_WIDGET_PATH + 'paused_icon.png';
assets.ready = IMAGES_STATUS_WIDGET_PATH + 'ready_icon.png';
assets.completed = IMAGES_STATUS_WIDGET_PATH + 'completed_icon.png';
assets.draft = IMAGES_STATUS_WIDGET_PATH + 'draft_icon.png';
assets.active = IMAGES_STATUS_WIDGET_PATH + 'active_icon.png';

assets.statusbulb_completed = IMAGES_STATUS_BULBS_PATH + 'ended.png';
assets.statusbulb_draft = IMAGES_STATUS_BULBS_PATH + 'incomplete.png';
assets.statusbulb_inflight = IMAGES_STATUS_BULBS_PATH + 'inflight.png';
assets.statusbulb_scheduled = IMAGES_STATUS_BULBS_PATH + 'scheduled.png';

assets.target_marker = IMAGES_CDESK_PATH + 'target_indicator_dark.png';
assets.display = IMAGES_CDESK_PATH + 'desktop_screen_icon.png';
assets.video = IMAGES_CDESK_PATH + 'video_screen_icon.png';
assets.social = IMAGES_CDESK_PATH + 'social_screen_icon.png';
assets.mobile = IMAGES_CDESK_PATH + 'smartphone_screen_icon.png';
assets.desktop = IMAGES_CDESK_PATH + 'desktop_screen_icon.png';
assets.smartphone = IMAGES_CDESK_PATH + 'smartphone_screen_icon.png';
assets.tablet = IMAGES_CDESK_PATH + 'tablet_screen_icon.png';

assets.gray_left = IMAGES_CALENDAR_PATH + 'cal_arrow_left_gray_16x16_2x.png';
assets.gray_left_act = IMAGES_CALENDAR_PATH + 'cal_arrow_left_gray_16x16_2x_active.png';
assets.gray_right = IMAGES_CALENDAR_PATH + 'cal_arrow_right_gray_16x16_2x.png';
assets.gray_right_act = IMAGES_CALENDAR_PATH + 'cal_arrow_right_gray_16x16_2x_active.png';
assets.orange_left = IMAGES_CALENDAR_PATH + 'cal_arrow_left_orange_16x16_2x.png';
assets.orange_left_act = IMAGES_CALENDAR_PATH + 'cal_arrow_left_orange_16x16_2x_active.png';
assets.orange_right = IMAGES_CALENDAR_PATH + 'cal_arrow_right_orange_16x16_2x.png';
assets.orange_right_act = IMAGES_CALENDAR_PATH + 'cal_arrow_right_orange_16x16_2x_active.png';
assets.green_left = IMAGES_CALENDAR_PATH + 'cal_arrow_left_green_16x16_2x.png';
assets.green_left_act = IMAGES_CALENDAR_PATH + 'cal_arrow_left_green_16x16_2x_active.png';
assets.green_right = IMAGES_CALENDAR_PATH + 'cal_arrow_right_green_16x16_2x.png';
assets.green_right_act = IMAGES_CALENDAR_PATH + 'cal_arrow_right_green_16x16_2x_active.png';

assets.css_custom_reports = STYLESHEETS_PATH + 'pages/custom_reports.css';
assets.css_table_list = STYLESHEETS_PATH + 'pages/table_list.css';
assets.css_reports_invoice_list = STYLESHEETS_PATH + 'pages/reports_invoice_list.css';
assets.css_visto_application = STYLESHEETS_PATH + 'visto_application.css';

assets.html_campaign_details = '/views/reporting/campaign_details.html';
assets.html_optimization = '/views/reporting/optimization.html';
assets.html_inventory = '/views/reporting/inventory.html';
assets.html_viewability = '/views/reporting/viewability.html';
assets.html_cost = '/views/reporting/cost.html';
assets.html_performance = '/views/reporting/performance.html';
assets.html_platform = '/views/reporting/platform.html';
assets.html_custom_report = '/views/reporting/custom_report.html';
assets.html_custom_report_upload = '/views/reporting/custom_report_upload.html';
assets.html_brands_drop_down = '/views/reporting/brands_drop_down.html';
assets.html_advertiser_drop_down = '/views/reporting/advertiser_drop_down.html';
assets.html_campaign_list = '/views/reporting/campaign_list.html';
assets.html_campaign_drop_down = '/views/reporting/campaign_drop_down.html';
assets.html_gauge = '/views/reporting/gauge.html';
assets.html_header = '/views/reporting/header.html';
assets.html_dashboard = '/views/reporting/dashboard.html';
assets.html_bubble_chart = '/views/reporting/bubble_chart.html';
assets.html_gantt_chart = '/views/reporting/gantt_chart.html';
assets.html_screen_chart = '/views/reporting/screen_chart.html';
assets.html_campaign_card = '/views/reporting/campaign_card.html';
assets.html_campaign_cost_card = '/views/reporting/campaign_cost_card.html';
assets.html_campaign_cost_filters = '/views/reporting/campaign_cost_filters.html';
assets.html_campaign_dashboard = '/views/reporting/campaign_dashboard.html';
assets.html_campaign_list_filters = '/views/reporting/campaign_list_filters.html';
assets.html_campaign_filters = '/views/reporting/campaign_filters.html';
assets.html_campaign_strategy_card = '/views/reporting/campaign_strategy_card.html';
assets.html_campaign_tactics_card = '/views/reporting/campaign_tactics_card.html';
assets.html_kpi_drop_down = '/views/reporting/kpi_drop_down.html';
assets.html_login = 'login.html';
assets.html_home = 'home.html';
assets.html_multi_select = '/views/reporting/multi_select.html';
assets.html_strategy_drop_down = '/views/reporting/strategy_drop_down.html';
assets.html_timeperiod_drop_down = '/views/reporting/timeperiod_drop_down.html';
assets.html_timeperiod_drop_down_picker = '/views/reporting/timeperiod_drop_down_picker.html';

assets.html_help = '/views/reporting/help.html';
assets.html_collective_report_listing = '/views/reporting/collective_report_listing.html';
assets.html_reports_schedule_list = '/views/reporting/reports_schedule_list.html';
assets.html_reports_invoice_list = '/views/reporting/reports_invoice_list.html';
assets.html_reports_invoice = '/views/reporting/reports_invoice.html';
assets.html_edit_collective_report = '/views/reporting/edit_collective_report.html';
assets.html_delete_collective_report = '/views/reporting/delete_collective_report.html';
assets.html_campaign_lst_filter = '/views/reporting/campaign_lst_filter.html';
assets.html_confirmation_modal = '/views/reporting/confirmation_modal.html';
assets.html_view_summary_modal = '/views/workflow/view_summary_modal.html';

assets.html_bar_chart = '/views/reporting/partials/bar_chart.html';
assets.html_report_header_tab = '/views/reporting/partials/reports_header_tab.html';
assets.html_add_report_filter = '/views/reporting/partials/add_report_filter.html';
assets.html_add_filter_users = '/views/reporting/partials/add_filter_users.html';
assets.html_add_report_dimension = '/views/reporting/partials/add_report_dimension.html';
assets.html_screen_header = '/views/reporting/partials/screen_header.html';
assets.html_daysofweek_header = '/views/reporting/partials/daysofweek_header.html';
assets.html_discrepancy_header = '/views/reporting/partials/discrepancy_header.html';
assets.html_format_header = '/views/reporting/partials/format_header.html';
assets.html_performance_header = '/views/reporting/partials/performance_header.html';
assets.html_cost_header = '/views/reporting/partials/cost_header.html';
assets.html_viewablity_header = '/views/reporting/partials/viewablity_header.html';
assets.html_margin_header = '/views/reporting/partials/margin_header.html';
assets.html_creatives_header = '/views/reporting/partials/creatives_header.html';
assets.html_adsizes_header = '/views/reporting/partials/adsizes_header.html';
assets.html_download_report = '/views/reporting/partials/download_report.html';
assets.html_header_filters = '/views/reporting/partials/header_filters.html';
assets.html_users_add_or_edit = '/views/reporting/partials/users_add_or_edit.html';
assets.html_filters_header = '/views/reporting/partials/filters_header.html';
assets.html_dashboard_filters_header = '/views/reporting/partials/dashboard_filters_header.html';
assets.html_upload_reports_filters_header= '/views/reporting/partials/upload_reports_filters_header.html';
assets.html_admin_header = '/views/reporting/partials/admin_header.html';
assets.html_admin_sub_header = '/views/reporting/partials/admin_sub_header.html';

assets.html_campaign_create = '/views/workflow/campaign_create.html';

assets.html_campaign_create_ad = '/views/workflow/campaign_overview.html';
assets.html_campaign_create_adBuild = '/views/workflow/campaign_ad_create.html';
assets.html_creative = '/views/workflow/creative.html';
assets.html_creative_preview = '/views/workflow/creative_preview.html';
assets.html_audit_dashboard = '/views/workflow/audit_dashboard.html';
assets.html_creative_list = '/views/workflow/creative_list.html';
assets.html_workflow_campaign_list = '/views/workflow/campaign_list.html';

assets.html_creative_drop_down = '/views/workflow/partials/creative_drop_down.html';
assets.html_platform_collective_bidder = '/views/workflow/partials/platforms/plat-collective-bidder.html';
assets.html_platform_app_nexus = '/views/workflow/partials/platforms/plat-app-nexus.html';
assets.html_accounts_add_or_edit_advertiser = '/views/workflow/partials/accounts_add_or_edit_advertiser.html';
assets.html_accounts_add_or_edit_brand = '/views/workflow/partials/accounts_add_or_edit_brand.html';
assets.html_accounts_add_or_edit = '/views/workflow/partials/accounts_add_or_edit.html';
assets.html_change_account_warning = '/views/workflow/partials/change_account_warning.html';
assets.html_edit_adgroup = '/views/workflow/partials/overview_partials/overview_createAdgroups.html';

// Visto 2.0 Templates
assets.html_dashboard_2 = '/views/visto2.0/dashboard.html';

assets.html_sub_account_drop_down = '/views/reporting/sub_account_drop_down.html';
assets.html_filter_drop_down = '/views/workflow/filter_drop_down.html';

// admin
assets.admin_accounts_subclient = '/views/workflow/partials/creative_add_bulk.html';
// assets.admin_accounts_subclient = '/views/workflow/partials/admin_accounts_subclientList.html';

assets.html_clone_campaign_popup = '/views/workflow/partials/clone_campaign_popup.html';
assets.html_ad_campaign_popup = '/views/workflow/partials/clone_ad_popup.html';

assets.html_add_credit_popup = '/views/reporting/partials/add_invoice_adjustment_popup.html';
assets.html_invocie_upload_SOR = '/views/reporting/partials/invoice_upload_SOR_popup.html';
assets.html_add_note_popup = '/views/reporting/partials/invoice_add_note.html';

assets.html_change_password = '/views/reporting/change_password.html';

// Admin page
assets.html_admin_home = '/views/workflow/admin_home.html';
assets.html_users = '/views/reporting/users.html';
assets.html_accounts = '/views/workflow/accounts.html';
assets.html_advertisers = '/views/workflow/advertisers.html';
assets.html_brands = '/views/workflow/brands.html';

// Vendors config
//assets.html_vendor_create = '/views/workflow/vendor_create.html';
//assets.html_vendors_list = '/views/workflow/vendors_list.html';
assets.html_vendors_config_list = '/views/workflow/vendors_config/vendors_config_list.html';
assets.html_vendor_config = '/views/workflow/vendors_config/vendor_config.html';
