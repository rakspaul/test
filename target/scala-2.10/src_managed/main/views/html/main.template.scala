
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
object main extends BaseScalaTemplate[play.api.templates.HtmlFormat.Appendable,Format[play.api.templates.HtmlFormat.Appendable]](play.api.templates.HtmlFormat) with play.api.templates.Template1[Html,play.api.templates.HtmlFormat.Appendable] {

    /**/
    def apply/*1.2*/(content: Html):play.api.templates.HtmlFormat.Appendable = {
        _display_ {

Seq[Any](format.raw/*1.17*/("""
<!DOCTYPE html>
<html ng-app='cdeskApp'>
  <head>
    <meta charset='utf-8'>
    <title>Reporting</title>
    <meta content='Collective Desk UI' name='description'>
    <meta content='Collective' name='author'>
    <link href='/assets/images/collective.png' rel='shortcut icon' type='image/x-icon'>
    <link href="/assets/stylesheets/jquery-ui-1.10.3.custom.min.css?body=1" media="all" rel="stylesheet" />
    <link href="/assets/stylesheets/bootstrap.min.css?body=1" media="all" rel="stylesheet" />
    <link href="/assets/stylesheets/bootstrap-theme.min.css?body=1" media="all" rel="stylesheet" />
    <link href="/assets/stylesheets/bootstrap-responsive.min.css?body=1" media="all" rel="stylesheet" />
    <link href="/assets/stylesheets/highcharts.css?body=1" media="all" rel="stylesheet" /> 
    <link href="//fonts.googleapis.com/css?family=Armata" media="screen" rel="stylesheet" />
    <link href="/assets/stylesheets/cdesk_application.css" media="all" rel="stylesheet" />

    <script>
      window.scala_api                = "http://dev-desk.collective-media.net/dataapi";
      window.workflow_api             = "http://dev-desk.collective-media.net/wapi";
    </script>
     
       
 
"""),_display_(Seq[Any](/*25.2*/ga())),format.raw/*25.6*/(""" 
"""),_display_(Seq[Any](/*26.2*/javascript())),format.raw/*26.14*/("""    

 <script> 
    window.assets                   = """),format.raw/*29.39*/("""{"""),format.raw/*29.40*/("""}"""),format.raw/*29.41*/(""";
    window.assets.target_marker     = "assets/images/cdesk/icn_goal.png";
    window.assets.platform_icon     = "assets/images/tag_icon.png";
    window.assets.ontrack           = "assets/images/statusWidget/on_track_icon.png";
    window.assets.underperforming   = "assets/images/statusWidget/underperforming_icon.png";
    window.assets.paused            = "assets/images/statusWidget/paused_icon.png";
    window.assets.ready             = "assets/images/statusWidget/ready_icon.png";
    window.assets.completed         = "assets/images/statusWidget/completed_icon.png";
    window.assets.draft             = "assets/images/statusWidget/draft_icon.png";
    window.assets.active            = "assets/images/statusWidget/active_icon.png";
    window.assets.display           = "assets/images/cdesk/desktop_screen_icon.png" ;
    window.assets.video             = "assets/images/cdesk/video_screen_icon.png" ;
    window.assets.social            = "assets/images/cdesk/social_screen_icon.png" ;
    window.assets.mobile            = "assets/images/cdesk/smartphone_screen_icon.png" ;
    window.assets.desktop           = "assets/images/cdesk/desktop_screen_icon.png" ;
    window.assets.smartphone        = "assets/images/cdesk/smartphone_screen_icon.png" ;
    window.assets.tablet            = "assets/images/cdesk/tablet_screen_icon.png" ;
</script>
</head>
<body>
<header></header>
</body>
"""),_display_(Seq[Any](/*51.2*/content)),format.raw/*51.9*/("""
</html>

"""))}
    }
    
    def render(content:Html): play.api.templates.HtmlFormat.Appendable = apply(content)
    
    def f:((Html) => play.api.templates.HtmlFormat.Appendable) = (content) => apply(content)
    
    def ref: this.type = this

}
                /*
                    -- GENERATED --
                    DATE: Fri Mar 06 15:59:38 IST 2015
                    SOURCE: /Users/richa/work/reach/crpt-ui/app/views/main.scala.html
                    HASH: 1089e1afc828fe59e8efd6e992d3e03a8ab0f179
                    MATRIX: 553->1|662->16|1898->1217|1923->1221|1961->1224|1995->1236|2078->1291|2107->1292|2136->1293|3571->2693|3599->2700
                    LINES: 19->1|22->1|46->25|46->25|47->26|47->26|50->29|50->29|50->29|72->51|72->51
                    -- GENERATED --
                */
            