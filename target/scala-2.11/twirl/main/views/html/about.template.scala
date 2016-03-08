
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
object about extends BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with play.twirl.api.Template0[play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply():play.twirl.api.HtmlFormat.Appendable = {
      _display_ {

Seq[Any](format.raw/*2.1*/("""<div class="myModal modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="about_popup">
        <span class="close unselectable" data-dismiss="modal" aria-hidden="true">×</span>
        <div class="logo"></div>
        <div class="version_detail">Version """),format.raw/*6.45*/("""{"""),format.raw/*6.46*/("""{"""),format.raw/*6.47*/("""version"""),format.raw/*6.54*/("""}"""),format.raw/*6.55*/("""}"""),format.raw/*6.56*/("""</div>
        <div class="copyright_section">
            <div>Copyright &copy; 2016, Collective, Inc.</div>
            <div class="rights_text">All Rights Reserved</div>
        </div>
    </div>
</div>
"""))}
  }

  def render(): play.twirl.api.HtmlFormat.Appendable = apply()

  def f:(() => play.twirl.api.HtmlFormat.Appendable) = () => apply()

  def ref: this.type = this

}
              /*
                  -- GENERATED --
                  DATE: Fri Mar 04 12:31:13 GMT+05:30 2016
                  SOURCE: /Users/laldinglianat/projects/crpt-ui/app/views/about.scala.html
                  HASH: 8cde5c8bf3b7fce3faa3c3c2b1b7f0f801696ee0
                  MATRIX: 600->22|935->330|963->331|991->332|1025->339|1053->340|1081->341
                  LINES: 22->2|26->6|26->6|26->6|26->6|26->6|26->6
                  -- GENERATED --
              */
          