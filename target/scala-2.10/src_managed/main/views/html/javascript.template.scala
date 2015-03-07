
package views.html

import play.templates._
import play.templates.TemplateMagic._

import play.api.templates._
import play.api.templates.PlayMagic._
import models._
import controllers._
import play.api.i18n._
import play.api.mvc._
import play.api.data._
import views.html._
/**/
object javascript extends BaseScalaTemplate[play.api.templates.HtmlFormat.Appendable,Format[play.api.templates.HtmlFormat.Appendable]](play.api.templates.HtmlFormat) with play.api.templates.Template0[play.api.templates.HtmlFormat.Appendable] {

    /**/
    def apply():play.api.templates.HtmlFormat.Appendable = {
        _display_ {

Seq[Any](format.raw/*1.1*/("""<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>

<script src="/assets/javascripts/bootstrap.min.js?body=1"></script>
<!--<script src="/assets/javascripts/angular.min.js?body=1"></script>-->
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.12/angular.js"></script>
<script src="/assets/javascripts/angular-cache-2.3.7.js?body=1"></script>
<script src="/assets/javascripts/angular-cookies.js?body=1"></script>
<script src="/assets/javascripts/angular-resource.min.js?body=1"></script>
<script src="/assets/javascripts/angular-route.min.js?body=1"></script>
<script src="/assets/javascripts/ng-infinite-scroll.min.js?body=1"></script>
<script src="/assets/javascripts/highcharts-ng.js?body=1"></script>
<script src="/assets/javascripts/highcharts.js?body=1"></script>
<script src="/assets/javascripts/highcharts-more.js?body=1"></script>
<script src="/assets/javascripts/solid-gauge.js?body=1"></script>
<script src="/assets/javascripts/moment.min.js?body=1"></script>
<script src="/assets/javascripts/underscore-min.js?body=1"></script>
<script src="/assets/javascripts/angulartics.js?body=1"></script>
<script src="/assets/javascripts/angulartics-ga.js?body=1"></script>
<script src="/assets/javascripts/d3.js?body=1"></script>
<script src="/assets/javascripts/angular-sanitize.js?body=1"></script>
<script src="/assets/javascripts/filesaver.js?body=1"></script>
<script src="/assets/javascripts/ui-bootstrap-tpls-0.12.1.min.js?body=1"></script>
<script src="/assets/javascripts/lrInfiniteScroll.js?body=1"></script>

<script src="/assets/javascripts/cdesk/app.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/CommonModule.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/charts/line.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/charts/actions.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/charts/columnline.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/charts/piechart.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/charts/solidgauge.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/services/DataService.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/services/datatransferservice.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/services/TransformerService.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/services/ConstantsService.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/services/RequestCancelService.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/services/UrlService.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/models/CampaignCDBData.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/models/CampaignCost.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/models/CampaignModel.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/models/DataStoreModel.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/controllers/HeaderController.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/directives/CommonDirectives.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/utils.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/services/AnalyticsService.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/d3/gauge.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/controllers/GaugeController.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/models/GaugeModel.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/d3/bubbleChart.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/controllers/BubbleChartController.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/models/BubbleChartModel.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/d3/screenChart.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/controllers/ScreenChartController.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/models/ScreenChartModel.js?body=1"></script>

<script src="/assets/javascripts/cdesk/common/d3/ganttChart.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/controllers/GanttChartController.js?body=1"></script>
<script src="/assets/javascripts/cdesk/common/models/GanttChartModel.js?body=1"></script>

<script src="/assets/javascripts/cdesk/dashboard/DashboardModule.js?body=1"></script>
<script src="/assets/javascripts/cdesk/dashboard/DashboardModel.js?body=1"></script>
<script src="/assets/javascripts/cdesk/dashboard/DashboardController.js?body=1"></script>

<script src="/assets/javascripts/cdesk/directives/largeListSearch.js?body=1"></script>
<script src="/assets/javascripts/cdesk/controllers/directive_controller.js?body=1"></script>
<script src="/assets/javascripts/cdesk/campaignList/CampaignListModule.js?body=1"></script>
<script src="/assets/javascripts/cdesk/campaignList/CampaignListModel.js?body=1"></script>
<script src="/assets/javascripts/cdesk/campaignList/CampaignListService.js?body=1"></script>
<script src="/assets/javascripts/cdesk/campaignList/CampaignListController.js?body=1"></script>


<script src="/assets/javascripts/cdesk/editActions/EditActionsModule.js?body=1"></script>
<script src="/assets/javascripts/cdesk/editActions/EditActionsModel.js?body=1"></script>
<script src="/assets/javascripts/cdesk/editActions/EditActionsService.js?body=1"></script>
<script src="/assets/javascripts/cdesk/editActions/EditActionsController.js?body=1"></script>

<script src="/assets/javascripts/cdesk/brands/BrandsModule.js?body=1"></script>
<script src="/assets/javascripts/cdesk/brands/BrandsController.js?body=1"></script>
<script src="/assets/javascripts/cdesk/brands/BrandsListController.js?body=1"></script>
<script src="/assets/javascripts/cdesk/brands/BrandsDirective.js?body=1"></script>
<script src="/assets/javascripts/cdesk/brands/BrandsService.js?body=1"></script>
<script src="/assets/javascripts/cdesk/brands/BrandsModel.js?body=1"></script>

<script src="/assets/javascripts/cdesk/campaign/CampaignModule.js?body=1"></script>
<script src="/assets/javascripts/cdesk/campaign/CampaignModel.js?body=1"></script>
<script src="/assets/javascripts/cdesk/campaign/CampaignController.js?body=1"></script>
<script src="/assets/javascripts/cdesk/campaign/CampaignDirective.js?body=1"></script>


<script src="/assets/javascripts/cdesk/timePeriod/TimePeriodModule.js?body=1"></script>
<script src="/assets/javascripts/cdesk/timePeriod/TimePeriodModel.js?body=1"></script>
<script src="/assets/javascripts/cdesk/timePeriod/TimePeriodDirective.js?body=1"></script>
<script src="/assets/javascripts/cdesk/timePeriod/TimePeriodController.js?body=1"></script>

<script src="/assets/javascripts/cdesk/login/LoginModule.js?body=1"></script>
<script src="/assets/javascripts/cdesk/login/LoginModel.js?body=1"></script>
<script src="/assets/javascripts/cdesk/login/LoginService.js?body=1"></script>
<script src="/assets/javascripts/cdesk/login/LoginController.js?body=1"></script>

<script src="/assets/javascripts/cdesk/controllers/campaign_details_controller.js?body=1"></script>
<script src="/assets/javascripts/cdesk/controllers/actions_controller.js?body=1"></script>
<script src="/assets/javascripts/cdesk/controllers/optimization_controller.js?body=1"></script>
<script src="/assets/javascripts/cdesk/controllers/inventory_controller.js?body=1"></script>
<script src="/assets/javascripts/cdesk/controllers/viewability_controller.js?body=1"></script>
<script src="/assets/javascripts/cdesk/controllers/cost_controller.js?body=1"></script>
<script src="/assets/javascripts/cdesk/controllers/performance_controller.js?body=1"></script>
<script src="/assets/javascripts/cdesk/directives/strategycard.js?body=1"></script>
<script src="/assets/javascripts/cdesk/directives/tacticcard.js?body=1"></script>
<script src="/assets/javascripts/cdesk/directives/campaigncard.js?body=1"></script>
<script src="/assets/javascripts/cdesk/directives/campaigncostcard.js?body=1"></script>
<script src="/assets/javascripts/cdesk/directives/campaignsort.js?body=1"></script>
<script src="/assets/javascripts/cdesk/directives/campaignlistsort.js?body=1"></script>
<script src="/assets/javascripts/cdesk/directives/campaigncostsort.js?body=1"></script>
<script src="/assets/javascripts/cdesk/directives/campaigndashboard.js?body=1"></script>
<script src="/assets/javascripts/cdesk/directives/reportfilters.js?body=1"></script>
<script src="/assets/javascripts/cdesk/directives/strategylist.js?body=1"></script>
<script src="/assets/javascripts/multiselect.js?body=1"></script>
<script src="/assets/javascripts/cdesk/models/domain_reports.js?body=1"></script>
<script src="/assets/javascripts/cdesk/models/action_type.js?body=1"></script>
<script src="/assets/javascripts/cdesk/models/activity_list.js?body=1"></script>
<script src="/assets/javascripts/cdesk/models/action_sub_type.js?body=1"></script>
<script src="/assets/javascripts/cdesk/models/tactic.js?body=1"></script>
<script src="/assets/javascripts/cdesk/services/inventoryservice.js?body=1"></script>
<script src="/assets/javascripts/cdesk/services/viewablityservice.js?body=1"></script>
<script src="/assets/javascripts/cdesk/services/performanceservice.js?body=1"></script>
<script src="/assets/javascripts/cdesk/services/costservice.js?body=1"></script>
<script src="/assets/javascripts/cdesk/services/optimizationservice.js?body=1"></script>
"""))}
    }
    
    def render(): play.api.templates.HtmlFormat.Appendable = apply()
    
    def f:(() => play.api.templates.HtmlFormat.Appendable) = () => apply()
    
    def ref: this.type = this

}
                /*
                    -- GENERATED --
                    DATE: Sat Mar 07 14:53:42 IST 2015
                    SOURCE: /Users/richa/work/reach/crpt-ui/app/views/javascript.scala.html
                    HASH: 3bd0cf4d877af7cb8693cba9f2cdd4514609abf1
                    MATRIX: 642->0
                    LINES: 22->1
                    -- GENERATED --
                */
            