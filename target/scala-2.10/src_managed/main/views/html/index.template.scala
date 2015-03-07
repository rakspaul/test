
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
object index extends BaseScalaTemplate[play.api.templates.HtmlFormat.Appendable,Format[play.api.templates.HtmlFormat.Appendable]](play.api.templates.HtmlFormat) with play.api.templates.Template0[play.api.templates.HtmlFormat.Appendable] {

    /**/
    def apply():play.api.templates.HtmlFormat.Appendable = {
        _display_ {

Seq[Any](_display_(Seq[Any](/*1.2*/main/*1.6*/ {_display_(Seq[Any](format.raw/*1.8*/("""
<div class='campaign-list-container' ng-view=''></div>
<div class='loading-spinner-holder loader'></div>
<script id="header" type="text/ng-template">
"""),_display_(Seq[Any](/*5.2*/routes/*5.8*/.Assets.at("html/header.html"))),format.raw/*5.38*/("""
</script>
<script id="brands_drop_down" type="text/ng-template">
"""),_display_(Seq[Any](/*8.2*/routes/*8.8*/.Assets.at("html/brands_drop_down.html"))),format.raw/*8.48*/("""
</script>
<script id="campaign_drop_down" type="text/ng-template">
"""),_display_(Seq[Any](/*11.2*/routes/*11.8*/.Assets.at("html/campaign_drop_down.html"))),format.raw/*11.50*/("""
</script>
<script id="timeperiod_drop_down" type="text/ng-template">
"""),_display_(Seq[Any](/*14.2*/routes/*14.8*/.Assets.at("html/timeperiod_drop_down.html"))),format.raw/*14.52*/("""
</script>
<script id="dashboard" type="text/ng-template">
"""),_display_(Seq[Any](/*17.2*/routes/*17.8*/.Assets.at("html/dashboard.html"))),format.raw/*17.41*/("""
</script>
<script id="gauge" type="text/ng-template">
"""),_display_(Seq[Any](/*20.2*/routes/*20.8*/.Assets.at("html/gauge.html"))),format.raw/*20.37*/("""
</script>
<script id="bubble_chart" type="text/ng-template">
"""),_display_(Seq[Any](/*23.2*/routes/*23.8*/.Assets.at("html/bubble_chart.html"))),format.raw/*23.44*/("""
</script>
<script id="screen_chart" type="text/ng-template">
"""),_display_(Seq[Any](/*26.2*/routes/*26.8*/.Assets.at("html/screen_chart.html"))),format.raw/*26.44*/("""
</script>
<script id="gantt_chart" type="text/ng-template">
"""),_display_(Seq[Any](/*29.2*/routes/*29.8*/.Assets.at("html/gantt_chart.html"))),format.raw/*29.43*/("""
</script>
<script id="campaign_list" type="text/ng-template">
"""),_display_(Seq[Any](/*32.2*/routes/*32.8*/.Assets.at("html/campaign_list.html"))),format.raw/*32.45*/("""
</script>
<script id="campaign_details" type="text/ng-template">
"""),_display_(Seq[Any](/*35.2*/routes/*35.8*/.Assets.at("html/campaign_details.html"))),format.raw/*35.48*/("""
</script>
<script id="campaign_filters" type="text/ng-template">
"""),_display_(Seq[Any](/*38.2*/routes/*38.8*/.Assets.at("html/campaign_filters.html"))),format.raw/*38.48*/("""
</script>
<script id="campaign_list_filters" type="text/ng-template">
"""),_display_(Seq[Any](/*41.2*/routes/*41.8*/.Assets.at("html/campaign_list_filters.html"))),format.raw/*41.53*/("""
</script>
<script id="campaign_cost_filters" type="text/ng-template">
"""),_display_(Seq[Any](/*44.2*/routes/*44.8*/.Assets.at("html/campaign_cost_filters.html"))),format.raw/*44.53*/("""
</script>
<script id="campaign_dashboard" type="text/ng-template">
"""),_display_(Seq[Any](/*47.2*/routes/*47.8*/.Assets.at("html/campaign_dashboard.html"))),format.raw/*47.50*/("""
</script>
<script id="campaign_card" type="text/ng-template">
"""),_display_(Seq[Any](/*50.2*/routes/*50.8*/.Assets.at("html/campaign_card.html"))),format.raw/*50.45*/("""
</script>
<script id="campaign_cost_card" type="text/ng-template">
"""),_display_(Seq[Any](/*53.2*/routes/*53.8*/.Assets.at("html/campaign_cost_card.html"))),format.raw/*53.50*/("""
</script>
<script id="campaign_strategy_card" type="text/ng-template">
"""),_display_(Seq[Any](/*56.2*/routes/*56.8*/.Assets.at("html/campaign_strategy_card.html"))),format.raw/*56.54*/("""
</script>
<script id="campaign_tactics_card" type="text/ng-template">
"""),_display_(Seq[Any](/*59.2*/routes/*59.8*/.Assets.at("html/campaign_tactics_card.html"))),format.raw/*59.53*/("""
</script>
<script id="optimization" type="text/ng-template">
"""),_display_(Seq[Any](/*62.2*/routes/*62.8*/.Assets.at("html/optimization.html"))),format.raw/*62.44*/("""
</script>
<script id="inventory" type="text/ng-template">
"""),_display_(Seq[Any](/*65.2*/routes/*65.8*/.Assets.at("html/inventory.html"))),format.raw/*65.41*/("""
</script>
<script id="viewability" type="text/ng-template">
"""),_display_(Seq[Any](/*68.2*/routes/*68.8*/.Assets.at("html/viewability.html"))),format.raw/*68.43*/("""
</script>
<script id="cost" type="text/ng-template">
"""),_display_(Seq[Any](/*71.2*/routes/*71.8*/.Assets.at("html/cost.html"))),format.raw/*71.36*/("""
</script>
<script id="performance" type="text/ng-template">
"""),_display_(Seq[Any](/*74.2*/routes/*74.8*/.Assets.at("html/performance.html"))),format.raw/*74.43*/("""
</script>
<script id="multi_select" type="text/ng-template">
"""),_display_(Seq[Any](/*77.2*/routes/*77.8*/.Assets.at("html/multi_select.html"))),format.raw/*77.44*/("""
</script>
<script id="reports_login" type="text/ng-template">
"""),_display_(Seq[Any](/*80.2*/routes/*80.8*/.Assets.at("html/reports_login.html"))),format.raw/*80.45*/("""
</script>
<script id="main_dashboard" type="text/ng-template">
"""),_display_(Seq[Any](/*83.2*/routes/*83.8*/.Assets.at("html/main_dashboard.html"))),format.raw/*83.46*/("""
</script>
""")))})),format.raw/*85.2*/("""
"""))}
    }
    
    def render(): play.api.templates.HtmlFormat.Appendable = apply()
    
    def f:(() => play.api.templates.HtmlFormat.Appendable) = () => apply()
    
    def ref: this.type = this

}
                /*
                    -- GENERATED --
                    DATE: Sat Mar 07 14:50:56 IST 2015
                    SOURCE: /Users/richa/work/reach/crpt-ui/app/views/index.scala.html
                    HASH: 0138b7628a31dc2dcec599348c118ef095e80d52
                    MATRIX: 646->1|657->5|695->7|885->163|898->169|949->199|1053->269|1066->275|1127->315|1234->387|1248->393|1312->435|1421->509|1435->515|1501->559|1599->622|1613->628|1668->661|1762->720|1776->726|1827->755|1928->821|1942->827|2000->863|2101->929|2115->935|2173->971|2273->1036|2287->1042|2344->1077|2446->1144|2460->1150|2519->1187|2624->1257|2638->1263|2700->1303|2805->1373|2819->1379|2881->1419|2991->1494|3005->1500|3072->1545|3182->1620|3196->1626|3263->1671|3370->1743|3384->1749|3448->1791|3550->1858|3564->1864|3623->1901|3730->1973|3744->1979|3808->2021|3919->2097|3933->2103|4001->2149|4111->2224|4125->2230|4192->2275|4293->2341|4307->2347|4365->2383|4463->2446|4477->2452|4532->2485|4632->2550|4646->2556|4703->2591|4796->2649|4810->2655|4860->2683|4960->2748|4974->2754|5031->2789|5132->2855|5146->2861|5204->2897|5306->2964|5320->2970|5379->3007|5482->3075|5496->3081|5556->3119|5601->3133
                    LINES: 22->1|22->1|22->1|26->5|26->5|26->5|29->8|29->8|29->8|32->11|32->11|32->11|35->14|35->14|35->14|38->17|38->17|38->17|41->20|41->20|41->20|44->23|44->23|44->23|47->26|47->26|47->26|50->29|50->29|50->29|53->32|53->32|53->32|56->35|56->35|56->35|59->38|59->38|59->38|62->41|62->41|62->41|65->44|65->44|65->44|68->47|68->47|68->47|71->50|71->50|71->50|74->53|74->53|74->53|77->56|77->56|77->56|80->59|80->59|80->59|83->62|83->62|83->62|86->65|86->65|86->65|89->68|89->68|89->68|92->71|92->71|92->71|95->74|95->74|95->74|98->77|98->77|98->77|101->80|101->80|101->80|104->83|104->83|104->83|106->85
                    -- GENERATED --
                */
            