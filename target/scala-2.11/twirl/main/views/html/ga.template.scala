
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
object ga extends BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with play.twirl.api.Template0[play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply():play.twirl.api.HtmlFormat.Appendable = {
      _display_ {

Seq[Any](format.raw/*2.1*/("""<script>
  (function(i,s,o,g,r,a,m)"""),format.raw/*3.27*/("""{"""),format.raw/*3.28*/("""i['GoogleAnalyticsObject']=r;i[r]=i[r]||function()"""),format.raw/*3.78*/("""{"""),format.raw/*3.79*/("""
    """),format.raw/*4.5*/("""(i[r].q=i[r].q||[]).push(arguments)"""),format.raw/*4.40*/("""}"""),format.raw/*4.41*/(""",i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  """),format.raw/*6.3*/("""}"""),format.raw/*6.4*/(""")(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', """"),_display_(/*8.18*/Play/*8.22*/.current.configuration.getString("application.ga_id")),format.raw/*8.75*/("""", 'auto');
</script>
"""))}
  }

  def render(): play.twirl.api.HtmlFormat.Appendable = apply()

  def f:(() => play.twirl.api.HtmlFormat.Appendable) = () => apply()

  def ref: this.type = this

}
              /*
                  -- GENERATED --
                  DATE: Fri Mar 04 12:31:13 GMT+05:30 2016
                  SOURCE: /Users/laldinglianat/projects/crpt-ui/app/views/ga.scala.html
                  HASH: 20697c3dc42bdf19ab1e9016d0ee3695d915e8ec
                  MATRIX: 597->22|659->57|687->58|764->108|792->109|823->114|885->149|913->150|1068->279|1095->280|1215->374|1227->378|1300->431
                  LINES: 22->2|23->3|23->3|23->3|23->3|24->4|24->4|24->4|26->6|26->6|28->8|28->8|28->8
                  -- GENERATED --
              */
          