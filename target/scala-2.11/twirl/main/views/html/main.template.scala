
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
object main extends BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with play.twirl.api.Template1[Html,play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply/*1.2*/(content: Html):play.twirl.api.HtmlFormat.Appendable = {
      _display_ {import play.api.Play

Seq[Any](format.raw/*1.17*/("""
"""),format.raw/*3.1*/("""<!DOCTYPE html>
<html>
  <head>
    <meta charset='utf-8'>
    <title ng-bind="'Visto | '+ title"></title>
    <meta content='Collective Desk UI' name='description'>
    <meta content='Collective' name='author'>
    <meta name="fragment" content="!" />
    <link href='/assets/images/collective.png' rel='shortcut icon' type='image/x-icon'>
    <link href='"""),_display_(/*12.18*/routes/*12.24*/.Assets.versioned("stylesheets/bootstrap.min.css")),format.raw/*12.74*/("""' media="all" rel="stylesheet" />
    <link href="//fonts.googleapis.com/css?family=Armata" media="screen" rel="stylesheet" />
    <link rel="stylesheet" media="all" href='"""),_display_(/*14.47*/routes/*14.53*/.Assets.versioned("stylesheets/cdesk_application.css")),format.raw/*14.107*/("""'>
    <script>
      window.scala_api                = '"""),_display_(/*16.43*/Play/*16.47*/.current.configuration.getString("application.scala_api")),format.raw/*16.104*/("""';
      window.scala_api_NEW            = '"""),_display_(/*17.43*/Play/*17.47*/.current.configuration.getString("application.scala_api_NEW")),format.raw/*17.108*/("""';
      window.workflow_api             = '"""),_display_(/*18.43*/Play/*18.47*/.current.configuration.getString("application.workflow_api")),format.raw/*18.107*/("""';
      window.workflowCreate_api       = '"""),_display_(/*19.43*/Play/*19.47*/.current.configuration.getString("application.workflowCreate_api")),format.raw/*19.113*/("""';
      window.version                  = '"""),_display_(/*20.43*/Play/*20.47*/.current.configuration.getString("application.version")),format.raw/*20.102*/("""';
      window.i18nlanguage             = '"""),_display_(/*21.43*/Play/*21.47*/.current.configuration.getString("application.language")),format.raw/*21.103*/("""';
      window.help_domain_url          = '"""),_display_(/*22.43*/Play/*22.47*/.current.configuration.getString("application.help_domain_url")),format.raw/*22.110*/("""';
    </script>
</head>
<body ng-cloak class=""""),format.raw/*25.23*/("""{"""),format.raw/*25.24*/("""{"""),format.raw/*25.25*/("""bodyclass"""),format.raw/*25.34*/("""}"""),format.raw/*25.35*/("""}"""),format.raw/*25.36*/(""" """),format.raw/*25.37*/("""{"""),format.raw/*25.38*/("""{"""),format.raw/*25.39*/("""productType"""),format.raw/*25.50*/("""}"""),format.raw/*25.51*/("""}"""),format.raw/*25.52*/(""" """),format.raw/*25.53*/("""{"""),format.raw/*25.54*/("""{"""),format.raw/*25.55*/("""customReport"""),format.raw/*25.67*/("""}"""),format.raw/*25.68*/("""}"""),format.raw/*25.69*/("""">
<header></header>
"""),_display_(/*27.2*/content),format.raw/*27.9*/("""
"""),_display_(/*28.2*/versions()),format.raw/*28.12*/("""
"""),format.raw/*29.1*/("""<script data-main='"""),_display_(/*29.21*/routes/*29.27*/.Assets.versioned("javascripts/main.js")),format.raw/*29.67*/("""' type='text/javascript' src='"""),_display_(/*29.98*/routes/*29.104*/.Assets.versioned("javascripts/vendor/require.min.js")),format.raw/*29.158*/("""' defer></script>
"""),_display_(/*30.2*/about()),format.raw/*30.9*/("""
"""),_display_(/*31.2*/ga()),format.raw/*31.6*/("""
"""),format.raw/*32.1*/("""</body>
</html>

"""))}
  }

  def render(content:Html): play.twirl.api.HtmlFormat.Appendable = apply(content)

  def f:((Html) => play.twirl.api.HtmlFormat.Appendable) = (content) => apply(content)

  def ref: this.type = this

}
              /*
                  -- GENERATED --
                  DATE: Fri Mar 04 12:31:13 GMT+05:30 2016
                  SOURCE: /Users/laldinglianat/projects/crpt-ui/app/views/main.scala.html
                  HASH: d54a3230fc94148a3d6ea114033b489094912ace
                  MATRIX: 502->1|625->16|652->39|1037->397|1052->403|1123->453|1323->626|1338->632|1414->686|1499->744|1512->748|1591->805|1663->850|1676->854|1759->915|1831->960|1844->964|1926->1024|1998->1069|2011->1073|2099->1139|2171->1184|2184->1188|2261->1243|2333->1288|2346->1292|2424->1348|2496->1393|2509->1397|2594->1460|2669->1507|2698->1508|2727->1509|2764->1518|2793->1519|2822->1520|2851->1521|2880->1522|2909->1523|2948->1534|2977->1535|3006->1536|3035->1537|3064->1538|3093->1539|3133->1551|3162->1552|3191->1553|3239->1575|3266->1582|3294->1584|3325->1594|3353->1595|3400->1615|3415->1621|3476->1661|3534->1692|3550->1698|3626->1752|3671->1771|3698->1778|3726->1780|3750->1784|3778->1785
                  LINES: 19->1|22->1|23->3|32->12|32->12|32->12|34->14|34->14|34->14|36->16|36->16|36->16|37->17|37->17|37->17|38->18|38->18|38->18|39->19|39->19|39->19|40->20|40->20|40->20|41->21|41->21|41->21|42->22|42->22|42->22|45->25|45->25|45->25|45->25|45->25|45->25|45->25|45->25|45->25|45->25|45->25|45->25|45->25|45->25|45->25|45->25|45->25|45->25|47->27|47->27|48->28|48->28|49->29|49->29|49->29|49->29|49->29|49->29|49->29|50->30|50->30|51->31|51->31|52->32
                  -- GENERATED --
              */
          