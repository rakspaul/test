
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
import play.api.Play
/**/
object versions extends BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with play.twirl.api.Template0[play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply():play.twirl.api.HtmlFormat.Appendable = {
      _display_ {

Seq[Any](format.raw/*2.1*/("""<script>
    var IMAGES_PATH = 'assets/images/',
        IMAGES_STATUS_WIDGET_PATH = IMAGES_PATH + 'statusWidget/',
        IMAGES_STATUS_BULBS_PATH = IMAGES_PATH + 'statusBulbs/',
        IMAGES_CDESK_PATH = IMAGES_PATH + 'cdesk/',
        IMAGES_CALENDAR_PATH = IMAGES_PATH + 'calendar/',
        STYLESHEETS_PATH = '../assets/stylesheets/',
        assets = """),format.raw/*9.18*/("""{"""),format.raw/*9.19*/("""}"""),format.raw/*9.20*/(""";

    assets.platform_icon     = IMAGES_PATH + 'tag_icon.png';

    assets.ontrack           = IMAGES_STATUS_WIDGET_PATH + 'on_track_icon.png';
    assets.underperforming   = IMAGES_STATUS_WIDGET_PATH + 'underperforming_icon.png';
    assets.paused            = IMAGES_STATUS_WIDGET_PATH + 'paused_icon.png';
    assets.ready             = IMAGES_STATUS_WIDGET_PATH + 'ready_icon.png';
    assets.completed         = IMAGES_STATUS_WIDGET_PATH + 'completed_icon.png';
    assets.draft             = IMAGES_STATUS_WIDGET_PATH + 'draft_icon.png';
    assets.active            = IMAGES_STATUS_WIDGET_PATH + 'active_icon.png';

    assets.statusbulb_completed  = IMAGES_STATUS_BULBS_PATH + 'ended.png';
    assets.statusbulb_draft      = IMAGES_STATUS_BULBS_PATH + 'incomplete.png';
    assets.statusbulb_inflight   = IMAGES_STATUS_BULBS_PATH + 'inflight.png';
    assets.statusbulb_scheduled  = IMAGES_STATUS_BULBS_PATH + 'scheduled.png';

    assets.target_marker     = IMAGES_CDESK_PATH + 'target_indicator_dark.png';
    assets.display           = IMAGES_CDESK_PATH + 'desktop_screen_icon.png';
    assets.video             = IMAGES_CDESK_PATH + 'video_screen_icon.png';
    assets.social            = IMAGES_CDESK_PATH + 'social_screen_icon.png';
    assets.mobile            = IMAGES_CDESK_PATH + 'smartphone_screen_icon.png';
    assets.desktop           = IMAGES_CDESK_PATH + 'desktop_screen_icon.png';
    assets.smartphone        = IMAGES_CDESK_PATH + 'smartphone_screen_icon.png';
    assets.tablet            = IMAGES_CDESK_PATH + 'tablet_screen_icon.png';

    assets.gray_left         = IMAGES_CALENDAR_PATH + 'cal_arrow_left_gray_16x16_2x.png';
    assets.gray_left_act     = IMAGES_CALENDAR_PATH + 'cal_arrow_left_gray_16x16_2x_active.png';
    assets.gray_right        = IMAGES_CALENDAR_PATH + 'cal_arrow_right_gray_16x16_2x.png';
    assets.gray_right_act    = IMAGES_CALENDAR_PATH + 'cal_arrow_right_gray_16x16_2x_active.png';
    assets.orange_left       = IMAGES_CALENDAR_PATH + 'cal_arrow_left_orange_16x16_2x.png';
    assets.orange_left_act   = IMAGES_CALENDAR_PATH + 'cal_arrow_left_orange_16x16_2x_active.png';
    assets.orange_right      = IMAGES_CALENDAR_PATH + 'cal_arrow_right_orange_16x16_2x.png';
    assets.orange_right_act  = IMAGES_CALENDAR_PATH + 'cal_arrow_right_orange_16x16_2x_active.png';
    assets.green_left        = IMAGES_CALENDAR_PATH + 'cal_arrow_left_green_16x16_2x.png';
    assets.green_left_act    = IMAGES_CALENDAR_PATH + 'cal_arrow_left_green_16x16_2x_active.png';
    assets.green_right       = IMAGES_CALENDAR_PATH + 'cal_arrow_right_green_16x16_2x.png';
    assets.green_right_act   = IMAGES_CALENDAR_PATH + 'cal_arrow_right_green_16x16_2x_active.png';

    assets.css_custom_reports        = STYLESHEETS_PATH + 'custom_reports.css';
    assets.css_reports_schedule_list = STYLESHEETS_PATH + 'reports_schedule_list.css';
    assets.css_visto_application     = STYLESHEETS_PATH + 'visto_application.css';

    assets.html_campaign_details          = '"""),_display_(/*52.47*/routes/*52.53*/.Assets.versioned("html/reporting/campaign_details.html")),format.raw/*52.110*/("""';
    assets.html_optimization              = '"""),_display_(/*53.47*/routes/*53.53*/.Assets.versioned("html/reporting/optimization.html")),format.raw/*53.106*/("""';
    assets.html_inventory                 = '"""),_display_(/*54.47*/routes/*54.53*/.Assets.versioned("html/reporting/inventory.html")),format.raw/*54.103*/("""';
    assets.html_viewability               = '"""),_display_(/*55.47*/routes/*55.53*/.Assets.versioned("html/reporting/viewability.html")),format.raw/*55.105*/("""';
    assets.html_cost                      = '"""),_display_(/*56.47*/routes/*56.53*/.Assets.versioned("html/reporting/cost.html")),format.raw/*56.98*/("""';
    assets.html_performance               = '"""),_display_(/*57.47*/routes/*57.53*/.Assets.versioned("html/reporting/performance.html")),format.raw/*57.105*/("""';
    assets.html_platform                  = '"""),_display_(/*58.47*/routes/*58.53*/.Assets.versioned("html/reporting/platform.html")),format.raw/*58.102*/("""';
    assets.html_custom_report             = '"""),_display_(/*59.47*/routes/*59.53*/.Assets.versioned("html/reporting/custom_report.html")),format.raw/*59.107*/("""';
    assets.html_custom_report_upload      = '"""),_display_(/*60.47*/routes/*60.53*/.Assets.versioned("html/reporting/custom_report_upload.html")),format.raw/*60.114*/("""';
    assets.html_brands_drop_down          = '"""),_display_(/*61.47*/routes/*61.53*/.Assets.versioned("html/reporting/brands_drop_down.html")),format.raw/*61.110*/("""';
    assets.html_advertiser_drop_down      = '"""),_display_(/*62.47*/routes/*62.53*/.Assets.versioned("html/reporting/advertiser_drop_down.html")),format.raw/*62.114*/("""';
    assets.html_campaign_list             = '"""),_display_(/*63.47*/routes/*63.53*/.Assets.versioned("html/reporting/campaign_list.html")),format.raw/*63.107*/("""';
    assets.html_campaign_drop_down        = '"""),_display_(/*64.47*/routes/*64.53*/.Assets.versioned("html/reporting/campaign_drop_down.html")),format.raw/*64.112*/("""';
    assets.html_gauge                     = '"""),_display_(/*65.47*/routes/*65.53*/.Assets.versioned("html/reporting/gauge.html")),format.raw/*65.99*/("""';
    assets.html_header                    = '"""),_display_(/*66.47*/routes/*66.53*/.Assets.versioned("html/reporting/header.html")),format.raw/*66.100*/("""';
    assets.html_dashboard                 = '"""),_display_(/*67.47*/routes/*67.53*/.Assets.versioned("html/reporting/dashboard.html")),format.raw/*67.103*/("""';
    assets.html_bubble_chart              = '"""),_display_(/*68.47*/routes/*68.53*/.Assets.versioned("html/reporting/bubble_chart.html")),format.raw/*68.106*/("""';
    assets.html_gantt_chart               = '"""),_display_(/*69.47*/routes/*69.53*/.Assets.versioned("html/reporting/gantt_chart.html")),format.raw/*69.105*/("""';
    assets.html_screen_chart              = '"""),_display_(/*70.47*/routes/*70.53*/.Assets.versioned("html/reporting/screen_chart.html")),format.raw/*70.106*/("""';
    assets.html_campaign_card             = '"""),_display_(/*71.47*/routes/*71.53*/.Assets.versioned("html/reporting/campaign_card.html")),format.raw/*71.107*/("""';
    assets.html_campaign_cost_card        = '"""),_display_(/*72.47*/routes/*72.53*/.Assets.versioned("html/reporting/campaign_cost_card.html")),format.raw/*72.112*/("""';
    assets.html_campaign_cost_filters     = '"""),_display_(/*73.47*/routes/*73.53*/.Assets.versioned("html/reporting/campaign_cost_filters.html")),format.raw/*73.115*/("""';
    assets.html_campaign_dashboard        = '"""),_display_(/*74.47*/routes/*74.53*/.Assets.versioned("html/reporting/campaign_dashboard.html")),format.raw/*74.112*/("""';
    assets.html_campaign_list_filters     = '"""),_display_(/*75.47*/routes/*75.53*/.Assets.versioned("html/reporting/campaign_list_filters.html")),format.raw/*75.115*/("""';
    assets.html_campaign_filters          = '"""),_display_(/*76.47*/routes/*76.53*/.Assets.versioned("html/reporting/campaign_filters.html")),format.raw/*76.110*/("""';
    assets.html_campaign_strategy_card    = '"""),_display_(/*77.47*/routes/*77.53*/.Assets.versioned("html/reporting/campaign_strategy_card.html")),format.raw/*77.116*/("""';
    assets.html_campaign_tactics_card     = '"""),_display_(/*78.47*/routes/*78.53*/.Assets.versioned("html/reporting/campaign_tactics_card.html")),format.raw/*78.115*/("""';
    assets.html_kpi_drop_down             = '"""),_display_(/*79.47*/routes/*79.53*/.Assets.versioned("html/reporting/kpi_drop_down.html")),format.raw/*79.107*/("""';
    assets.html_reports_login             = '"""),_display_(/*80.47*/routes/*80.53*/.Assets.versioned("html/reporting/reports_login.html")),format.raw/*80.107*/("""';
    assets.html_multi_select              = '"""),_display_(/*81.47*/routes/*81.53*/.Assets.versioned("html/reporting/multi_select.html")),format.raw/*81.106*/("""';
    assets.html_strategy_drop_down        = '"""),_display_(/*82.47*/routes/*82.53*/.Assets.versioned("html/reporting/strategy_drop_down.html")),format.raw/*82.112*/("""';
    assets.html_timeperiod_drop_down      = '"""),_display_(/*83.47*/routes/*83.53*/.Assets.versioned("html/reporting/timeperiod_drop_down.html")),format.raw/*83.114*/("""';
    assets.html_timeperiod_drop_down_picker  = '"""),_display_(/*84.50*/routes/*84.56*/.Assets.versioned("html/reporting/timeperiod_drop_down_picker.html")),format.raw/*84.124*/("""';
    assets.html_users                     = '"""),_display_(/*85.47*/routes/*85.53*/.Assets.versioned("html/reporting/users.html")),format.raw/*85.99*/("""';
    assets.html_help                      = '"""),_display_(/*86.47*/routes/*86.53*/.Assets.versioned("html/reporting/help.html")),format.raw/*86.98*/("""';
    assets.html_collective_report_listing = '"""),_display_(/*87.47*/routes/*87.53*/.Assets.versioned("html/reporting/collective_report_listing.html")),format.raw/*87.119*/("""';
    assets.html_reports_schedule_list     = '"""),_display_(/*88.47*/routes/*88.53*/.Assets.versioned("html/reporting/reports_schedule_list.html")),format.raw/*88.115*/("""';
    assets.html_edit_collective_report    = '"""),_display_(/*89.47*/routes/*89.53*/.Assets.versioned("html/reporting/edit_collective_report.html")),format.raw/*89.116*/("""';
    assets.html_delete_collective_report  = '"""),_display_(/*90.47*/routes/*90.53*/.Assets.versioned("html/reporting/delete_collective_report.html")),format.raw/*90.118*/("""';
    assets.html_campaign_lst_filter       = '"""),_display_(/*91.47*/routes/*91.53*/.Assets.versioned("html/reporting/campaign_lst_filter.html")),format.raw/*91.113*/("""';
    assets.html_confirmation_modal        = '"""),_display_(/*92.47*/routes/*92.53*/.Assets.versioned("html/reporting/confirmation_modal.html")),format.raw/*92.112*/("""';

    assets.html_bar_chart            = '"""),_display_(/*94.42*/routes/*94.48*/.Assets.versioned("html/reporting/partials/bar_chart.html")),format.raw/*94.107*/("""';
    assets.html_report_header_tab    = '"""),_display_(/*95.42*/routes/*95.48*/.Assets.versioned("html/reporting/partials/reports_header_tab.html")),format.raw/*95.116*/("""';
    assets.html_add_report_filter    = '"""),_display_(/*96.42*/routes/*96.48*/.Assets.versioned("html/reporting/partials/add_report_filter.html")),format.raw/*96.115*/("""';
    assets.html_add_filter_users     = '"""),_display_(/*97.42*/routes/*97.48*/.Assets.versioned("html/reporting/partials/add_filter_users.html")),format.raw/*97.114*/("""';
    assets.html_add_report_dimension = '"""),_display_(/*98.42*/routes/*98.48*/.Assets.versioned("html/reporting/partials/add_report_dimension.html")),format.raw/*98.118*/("""';
    assets.html_screen_header        = '"""),_display_(/*99.42*/routes/*99.48*/.Assets.versioned("html/reporting/partials/screen_header.html")),format.raw/*99.111*/("""';
    assets.html_daysofweek_header    = '"""),_display_(/*100.42*/routes/*100.48*/.Assets.versioned("html/reporting/partials/daysofweek_header.html")),format.raw/*100.115*/("""';
    assets.html_format_header        = '"""),_display_(/*101.42*/routes/*101.48*/.Assets.versioned("html/reporting/partials/format_header.html")),format.raw/*101.111*/("""';
    assets.html_performance_header   = '"""),_display_(/*102.42*/routes/*102.48*/.Assets.versioned("html/reporting/partials/performance_header.html")),format.raw/*102.116*/("""';
    assets.html_cost_header          = '"""),_display_(/*103.42*/routes/*103.48*/.Assets.versioned("html/reporting/partials/cost_header.html")),format.raw/*103.109*/("""';
    assets.html_viewablity_header    = '"""),_display_(/*104.42*/routes/*104.48*/.Assets.versioned("html/reporting/partials/viewablity_header.html")),format.raw/*104.115*/("""';
    assets.html_margin_header        = '"""),_display_(/*105.42*/routes/*105.48*/.Assets.versioned("html/reporting/partials/margin_header.html")),format.raw/*105.111*/("""';
    assets.html_creatives_header     = '"""),_display_(/*106.42*/routes/*106.48*/.Assets.versioned("html/reporting/partials/creatives_header.html")),format.raw/*106.114*/("""';
    assets.html_adsizes_header       = '"""),_display_(/*107.42*/routes/*107.48*/.Assets.versioned("html/reporting/partials/adsizes_header.html")),format.raw/*107.112*/("""';
    assets.html_download_report      = '"""),_display_(/*108.42*/routes/*108.48*/.Assets.versioned("html/reporting/partials/download_report.html")),format.raw/*108.113*/("""';
    assets.html_header_filters       = '"""),_display_(/*109.42*/routes/*109.48*/.Assets.versioned("html/reporting/partials/header_filters.html")),format.raw/*109.112*/("""';
    assets.html_users_add_or_edit    = '"""),_display_(/*110.42*/routes/*110.48*/.Assets.versioned("html/reporting/partials/users_add_or_edit.html")),format.raw/*110.115*/("""';
    assets.html_filters_header       = '"""),_display_(/*111.42*/routes/*111.48*/.Assets.versioned("html/reporting/partials/filters_header.html")),format.raw/*111.112*/("""';

    assets.html_campaign_create         = '"""),_display_(/*113.45*/routes/*113.51*/.Assets.versioned("html/workflow/campaign_create.html")),format.raw/*113.106*/("""';
    assets.html_campaign_create_ad      = '"""),_display_(/*114.45*/routes/*114.51*/.Assets.versioned("html/workflow/campaign_overview.html")),format.raw/*114.108*/("""';
    assets.html_campaign_create_adBuild = '"""),_display_(/*115.45*/routes/*115.51*/.Assets.versioned("html/workflow/campaign_ad_create.html")),format.raw/*115.109*/("""';
    assets.html_creative                = '"""),_display_(/*116.45*/routes/*116.51*/.Assets.versioned("html/workflow/creative.html")),format.raw/*116.99*/("""';
    assets.html_creative_list           = '"""),_display_(/*117.45*/routes/*117.51*/.Assets.versioned("html/workflow/creative_list.html")),format.raw/*117.104*/("""';
    assets.html_workflow_campaign_list  = '"""),_display_(/*118.45*/routes/*118.51*/.Assets.versioned("html/workflow/campaign_list.html")),format.raw/*118.104*/("""';
    assets.html_accounts                = '"""),_display_(/*119.45*/routes/*119.51*/.Assets.versioned("html/workflow/accounts.html")),format.raw/*119.99*/("""';

    assets.html_creative_drop_down              = '"""),_display_(/*121.53*/routes/*121.59*/.Assets.versioned("html/workflow/partials/creative_drop_down.html")),format.raw/*121.126*/("""';
    assets.html_platform_collective_bidder      = 
        '"""),_display_(/*123.11*/routes/*123.17*/.Assets.versioned("html/workflow/partials/platforms/plat-collective-bidder.html")),format.raw/*123.98*/("""';
    assets.html_platform_app_nexus              = '"""),_display_(/*124.53*/routes/*124.59*/.Assets.versioned("html/workflow/partials/platforms/plat-app-nexus.html")),format.raw/*124.132*/("""';
    assets.html_accounts_add_or_edit_advertiser = 
        '"""),_display_(/*126.11*/routes/*126.17*/.Assets.versioned("html/workflow/partials/accounts_add_or_edit_advertiser.html")),format.raw/*126.97*/("""';
    assets.html_accounts_add_or_edit_brand      = '"""),_display_(/*127.53*/routes/*127.59*/.Assets.versioned("html/workflow/partials/accounts_add_or_edit_brand.html")),format.raw/*127.134*/("""';
    assets.html_accounts_add_or_edit            = '"""),_display_(/*128.53*/routes/*128.59*/.Assets.versioned("html/workflow/partials/accounts_add_or_edit.html")),format.raw/*128.128*/("""';
    assets.html_change_account_warning          = '"""),_display_(/*129.53*/routes/*129.59*/.Assets.versioned("html/workflow/partials/change_account_warning.html")),format.raw/*129.130*/("""';
    
    //Visto 2.0 Templates
    assets.html_dashboard_2          = '"""),_display_(/*132.42*/routes/*132.48*/.Assets.versioned("html/visto2.0/dashboard.html")),format.raw/*132.97*/("""';
</script>"""))}
  }

  def render(): play.twirl.api.HtmlFormat.Appendable = apply()

  def f:(() => play.twirl.api.HtmlFormat.Appendable) = () => apply()

  def ref: this.type = this

}
              /*
                  -- GENERATED --
                  DATE: Fri Mar 04 12:31:13 GMT+05:30 2016
                  SOURCE: /Users/laldinglianat/projects/crpt-ui/app/views/versions.scala.html
                  HASH: 941a6d4cb755ebada8ce9c84ca40f108b931df67
                  MATRIX: 603->22|991->383|1019->384|1047->385|4078->3389|4093->3395|4172->3452|4248->3501|4263->3507|4338->3560|4414->3609|4429->3615|4501->3665|4577->3714|4592->3720|4666->3772|4742->3821|4757->3827|4823->3872|4899->3921|4914->3927|4988->3979|5064->4028|5079->4034|5150->4083|5226->4132|5241->4138|5317->4192|5393->4241|5408->4247|5491->4308|5567->4357|5582->4363|5661->4420|5737->4469|5752->4475|5835->4536|5911->4585|5926->4591|6002->4645|6078->4694|6093->4700|6174->4759|6250->4808|6265->4814|6332->4860|6408->4909|6423->4915|6492->4962|6568->5011|6583->5017|6655->5067|6731->5116|6746->5122|6821->5175|6897->5224|6912->5230|6986->5282|7062->5331|7077->5337|7152->5390|7228->5439|7243->5445|7319->5499|7395->5548|7410->5554|7491->5613|7567->5662|7582->5668|7666->5730|7742->5779|7757->5785|7838->5844|7914->5893|7929->5899|8013->5961|8089->6010|8104->6016|8183->6073|8259->6122|8274->6128|8359->6191|8435->6240|8450->6246|8534->6308|8610->6357|8625->6363|8701->6417|8777->6466|8792->6472|8868->6526|8944->6575|8959->6581|9034->6634|9110->6683|9125->6689|9206->6748|9282->6797|9297->6803|9380->6864|9459->6916|9474->6922|9564->6990|9640->7039|9655->7045|9722->7091|9798->7140|9813->7146|9879->7191|9955->7240|9970->7246|10058->7312|10134->7361|10149->7367|10233->7429|10309->7478|10324->7484|10409->7547|10485->7596|10500->7602|10587->7667|10663->7716|10678->7722|10760->7782|10836->7831|10851->7837|10932->7896|11004->7941|11019->7947|11100->8006|11171->8050|11186->8056|11276->8124|11347->8168|11362->8174|11451->8241|11522->8285|11537->8291|11625->8357|11696->8401|11711->8407|11803->8477|11874->8521|11889->8527|11974->8590|12046->8634|12062->8640|12152->8707|12224->8751|12240->8757|12326->8820|12398->8864|12414->8870|12505->8938|12577->8982|12593->8988|12677->9049|12749->9093|12765->9099|12855->9166|12927->9210|12943->9216|13029->9279|13101->9323|13117->9329|13206->9395|13278->9439|13294->9445|13381->9509|13453->9553|13469->9559|13557->9624|13629->9668|13645->9674|13732->9738|13804->9782|13820->9788|13910->9855|13982->9899|13998->9905|14085->9969|14161->10017|14177->10023|14255->10078|14330->10125|14346->10131|14426->10188|14501->10235|14517->10241|14598->10299|14673->10346|14689->10352|14759->10400|14834->10447|14850->10453|14926->10506|15001->10553|15017->10559|15093->10612|15168->10659|15184->10665|15254->10713|15338->10769|15354->10775|15444->10842|15536->10906|15552->10912|15655->10993|15738->11048|15754->11054|15850->11127|15942->11191|15958->11197|16060->11277|16143->11332|16159->11338|16257->11413|16340->11468|16356->11474|16448->11543|16531->11598|16547->11604|16641->11675|16744->11750|16760->11756|16831->11805
                  LINES: 22->2|29->9|29->9|29->9|72->52|72->52|72->52|73->53|73->53|73->53|74->54|74->54|74->54|75->55|75->55|75->55|76->56|76->56|76->56|77->57|77->57|77->57|78->58|78->58|78->58|79->59|79->59|79->59|80->60|80->60|80->60|81->61|81->61|81->61|82->62|82->62|82->62|83->63|83->63|83->63|84->64|84->64|84->64|85->65|85->65|85->65|86->66|86->66|86->66|87->67|87->67|87->67|88->68|88->68|88->68|89->69|89->69|89->69|90->70|90->70|90->70|91->71|91->71|91->71|92->72|92->72|92->72|93->73|93->73|93->73|94->74|94->74|94->74|95->75|95->75|95->75|96->76|96->76|96->76|97->77|97->77|97->77|98->78|98->78|98->78|99->79|99->79|99->79|100->80|100->80|100->80|101->81|101->81|101->81|102->82|102->82|102->82|103->83|103->83|103->83|104->84|104->84|104->84|105->85|105->85|105->85|106->86|106->86|106->86|107->87|107->87|107->87|108->88|108->88|108->88|109->89|109->89|109->89|110->90|110->90|110->90|111->91|111->91|111->91|112->92|112->92|112->92|114->94|114->94|114->94|115->95|115->95|115->95|116->96|116->96|116->96|117->97|117->97|117->97|118->98|118->98|118->98|119->99|119->99|119->99|120->100|120->100|120->100|121->101|121->101|121->101|122->102|122->102|122->102|123->103|123->103|123->103|124->104|124->104|124->104|125->105|125->105|125->105|126->106|126->106|126->106|127->107|127->107|127->107|128->108|128->108|128->108|129->109|129->109|129->109|130->110|130->110|130->110|131->111|131->111|131->111|133->113|133->113|133->113|134->114|134->114|134->114|135->115|135->115|135->115|136->116|136->116|136->116|137->117|137->117|137->117|138->118|138->118|138->118|139->119|139->119|139->119|141->121|141->121|141->121|143->123|143->123|143->123|144->124|144->124|144->124|146->126|146->126|146->126|147->127|147->127|147->127|148->128|148->128|148->128|149->129|149->129|149->129|152->132|152->132|152->132
                  -- GENERATED --
              */
          