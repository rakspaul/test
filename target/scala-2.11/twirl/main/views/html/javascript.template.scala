
package views.html

import play.twirl.api._
import play.twirl.api.TemplateMagic._

import play.api.templates.PlayMagic._
import models._
import controllers._
import play.api.i18n._
import play.api.mvc._
import play.api.data._
import views.html._

/**/
object javascript extends BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with play.twirl.api.Template0[play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply():play.twirl.api.HtmlFormat.Appendable = {
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
<!--<script src="/assets/javascripts/icons.js?body=1"></script>-->
<script src="/assets/javascripts/angulartics.js?body=1"></script>
<script src="/assets/javascripts/angulartics-ga.js?body=1"></script>
<script src="/assets/javascripts/d3.js?body=1"></script>
<script src="/assets/javascripts/angular-sanitize.js?body=1"></script>
<script src="/assets/javascripts/filesaver.js?body=1"></script>
<script src="/assets/javascripts/ui-bootstrap-tpls-0.12.1.min.js?body=1"></script>
<script src="/assets/javascripts/lrInfiniteScroll.js?body=1"></script>

<!--<script src="/assets/javascripts/app.js?body=1"></script>
<script src="/assets/javascripts/common/CommonModule.js?body=1"></script>
<script src="/assets/javascripts/common/charts/line.js?body=1"></script>
<script src="/assets/javascripts/common/charts/actions.js?body=1"></script>
<script src="/assets/javascripts/common/charts/columnline.js?body=1"></script>
<script src="/assets/javascripts/common/charts/piechart.js?body=1"></script>
<script src="/assets/javascripts/common/charts/solidgauge.js?body=1"></script>
<script src="/assets/javascripts/common/services/DataService.js?body=1"></script>
<script src="/assets/javascripts/common/services/datatransferservice.js?body=1"></script>
<script src="/assets/javascripts/common/services/TransformerService.js?body=1"></script>
<script src="/assets/javascripts/common/services/ConstantsService.js?body=1"></script>
<script src="/assets/javascripts/common/services/RequestCancelService.js?body=1"></script>
<script src="/assets/javascripts/common/services/UrlService.js?body=1"></script>
<script src="/assets/javascripts/common/models/CampaignCDBData.js?body=1"></script>
<script src="/assets/javascripts/common/models/CampaignCost.js?body=1"></script>
<script src="/assets/javascripts/common/models/CampaignModel.js?body=1"></script>
<script src="/assets/javascripts/common/models/DataStoreModel.js?body=1"></script>
<script src="/assets/javascripts/common/controllers/HeaderController.js?body=1"></script>
<script src="/assets/javascripts/common/directives/CommonDirectives.js?body=1"></script>
<script src="/assets/javascripts/common/utils.js?body=1"></script>
<script src="/assets/javascripts/common/services/AnalyticsService.js?body=1"></script>
<script src="/assets/javascripts/common/d3/gauge.js?body=1"></script>
<script src="/assets/javascripts/common/controllers/GaugeController.js?body=1"></script>
<script src="/assets/javascripts/common/models/GaugeModel.js?body=1"></script>
<script src="/assets/javascripts/common/d3/bubbleChart.js?body=1"></script>
<script src="/assets/javascripts/common/controllers/BubbleChartController.js?body=1"></script>
<script src="/assets/javascripts/common/models/BubbleChartModel.js?body=1"></script>
<script src="/assets/javascripts/common/d3/screenChart.js?body=1"></script>
<script src="/assets/javascripts/common/controllers/ScreenChartController.js?body=1"></script>
<script src="/assets/javascripts/common/models/ScreenChartModel.js?body=1"></script>

<script src="/assets/javascripts/common/d3/ganttChart.js?body=1"></script>
<script src="/assets/javascripts/common/controllers/GanttChartController.js?body=1"></script>
<script src="/assets/javascripts/common/models/GanttChartModel.js?body=1"></script>

<script src="/assets/javascripts/dashboard/DashboardModule.js?body=1"></script>
<script src="/assets/javascripts/dashboard/DashboardModel.js?body=1"></script>
<script src="/assets/javascripts/dashboard/DashboardController.js?body=1"></script>

<script src="/assets/javascripts/directives/largeListSearch.js?body=1"></script>
<script src="/assets/javascripts/controllers/directive_controller.js?body=1"></script>
<script src="/assets/javascripts/campaignList/CampaignListModule.js?body=1"></script>
<script src="/assets/javascripts/campaignList/CampaignListModel.js?body=1"></script>
<script src="/assets/javascripts/campaignList/CampaignListService.js?body=1"></script>
<script src="/assets/javascripts/campaignList/CampaignListController.js?body=1"></script>


<script src="/assets/javascripts/editActions/EditActionsModule.js?body=1"></script>
<script src="/assets/javascripts/editActions/EditActionsModel.js?body=1"></script>
<script src="/assets/javascripts/editActions/EditActionsService.js?body=1"></script>
<script src="/assets/javascripts/editActions/EditActionsController.js?body=1"></script>

<script src="/assets/javascripts/brands/BrandsModule.js?body=1"></script>
<script src="/assets/javascripts/brands/BrandsController.js?body=1"></script>
<script src="/assets/javascripts/brands/BrandsListController.js?body=1"></script>
<script src="/assets/javascripts/brands/BrandsDirective.js?body=1"></script>
<script src="/assets/javascripts/brands/BrandsService.js?body=1"></script>
<script src="/assets/javascripts/brands/BrandsModel.js?body=1"></script>



<script src="/assets/javascripts/timePeriod/TimePeriodModule.js?body=1"></script>
<script src="/assets/javascripts/timePeriod/TimePeriodModel.js?body=1"></script>
<script src="/assets/javascripts/timePeriod/TimePeriodDirective.js?body=1"></script>
<script src="/assets/javascripts/timePeriod/TimePeriodController.js?body=1"></script>


<script src="/assets/javascripts/login/LoginModule.js?body=1"></script>
<script src="/assets/javascripts/login/LoginModel.js?body=1"></script>
<script src="/assets/javascripts/login/LoginService.js?body=1"></script>
<script src="/assets/javascripts/login/LoginController.js?body=1"></script>

<script src="/assets/javascripts/controllers/campaign_details_controller.js?body=1"></script>
<script src="/assets/javascripts/controllers/actions_controller.js?body=1"></script>
<script src="/assets/javascripts/controllers/optimization_controller.js?body=1"></script>
<script src="/assets/javascripts/controllers/inventory_controller.js?body=1"></script>
<script src="/assets/javascripts/controllers/viewability_controller.js?body=1"></script>
<script src="/assets/javascripts/controllers/cost_controller.js?body=1"></script>
<script src="/assets/javascripts/controllers/performance_controller.js?body=1"></script>
<script src="/assets/javascripts/directives/strategycard.js?body=1"></script>
<script src="/assets/javascripts/directives/tacticcard.js?body=1"></script>
<script src="/assets/javascripts/directives/campaigncard.js?body=1"></script>
<script src="/assets/javascripts/directives/campaigncostcard.js?body=1"></script>
<script src="/assets/javascripts/directives/campaignsort.js?body=1"></script>
<script src="/assets/javascripts/directives/campaignlistsort.js?body=1"></script>
<script src="/assets/javascripts/directives/campaigncostsort.js?body=1"></script>
<script src="/assets/javascripts/directives/campaigndashboard.js?body=1"></script>
<script src="/assets/javascripts/directives/reportfilters.js?body=1"></script>
<script src="/assets/javascripts/directives/strategylist.js?body=1"></script>
<script src="/assets/javascripts/multiselect.js?body=1"></script>
<script src="/assets/javascripts/models/domain_reports.js?body=1"></script>
<script src="/assets/javascripts/models/action_type.js?body=1"></script>
<script src="/assets/javascripts/models/activity_list.js?body=1"></script>
<script src="/assets/javascripts/models/action_sub_type.js?body=1"></script>
<script src="/assets/javascripts/models/tactic.js?body=1"></script>
<script src="/assets/javascripts/services/inventoryservice.js?body=1"></script>
<script src="/assets/javascripts/services/viewablityservice.js?body=1"></script>
<script src="/assets/javascripts/services/performanceservice.js?body=1"></script>
<script src="/assets/javascripts/services/costservice.js?body=1"></script>
<script src="/assets/javascripts/services/optimizationservice.js?body=1"></script>
-->
"""))}
  }

  def render(): play.twirl.api.HtmlFormat.Appendable = apply()

  def f:(() => play.twirl.api.HtmlFormat.Appendable) = () => apply()

  def ref: this.type = this

}
              /*
                  -- GENERATED --
                  DATE: Fri Mar 04 12:31:13 GMT+05:30 2016
                  SOURCE: /Users/laldinglianat/projects/crpt-ui/app/views/javascript.scala.html
                  HASH: 75734d40751f04213c7c51a54af114d36611db6e
                  MATRIX: 585->0
                  LINES: 22->1
                  -- GENERATED --
              */
          