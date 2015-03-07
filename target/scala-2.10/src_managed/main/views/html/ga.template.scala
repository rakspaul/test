
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
object ga extends BaseScalaTemplate[play.api.templates.HtmlFormat.Appendable,Format[play.api.templates.HtmlFormat.Appendable]](play.api.templates.HtmlFormat) with play.api.templates.Template0[play.api.templates.HtmlFormat.Appendable] {

    /**/
    def apply():play.api.templates.HtmlFormat.Appendable = {
        _display_ {

Seq[Any](format.raw/*1.1*/("""<script>
  (function(i,s,o,g,r,a,m)"""),format.raw/*2.27*/("""{"""),format.raw/*2.28*/("""i['GoogleAnalyticsObject']=r;i[r]=i[r]||function()"""),format.raw/*2.78*/("""{"""),format.raw/*2.79*/("""
    (i[r].q=i[r].q||[]).push(arguments)"""),format.raw/*3.40*/("""}"""),format.raw/*3.41*/(""",i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  """),format.raw/*5.3*/("""}"""),format.raw/*5.4*/(""")(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', "#"""),format.raw/*7.18*/("""{"""),format.raw/*7.19*/("""ga_id"""),format.raw/*7.24*/("""}"""),format.raw/*7.25*/("""", 'auto');
  //ga('send', 'pageview');
</script>
"""))}
    }
    
    def render(): play.api.templates.HtmlFormat.Appendable = apply()
    
    def f:(() => play.api.templates.HtmlFormat.Appendable) = () => apply()
    
    def ref: this.type = this

}
                /*
                    -- GENERATED --
                    DATE: Fri Mar 06 15:59:38 IST 2015
                    SOURCE: /Users/richa/work/reach/crpt-ui/app/views/ga.scala.html
                    HASH: 7222c285b88378d78d6be904dd1abbac977bbd1c
                    MATRIX: 634->0|696->35|724->36|801->86|829->87|896->127|924->128|1079->257|1106->258|1227->352|1255->353|1287->358|1315->359
                    LINES: 22->1|23->2|23->2|23->2|23->2|24->3|24->3|26->5|26->5|28->7|28->7|28->7|28->7
                    -- GENERATED --
                */
            