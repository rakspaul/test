package controllers
import java.io.File

import play.Play
import play.api.mvc.Action
import play.api._
import play.api.mvc._
import play.api.cache._
import play.api.Play.current

object Application extends Controller {

  def index(any: String) = Action {
      Ok(views.html.index())
  }

    /** resolve "any" into the corresponding HTML page URI */
    def getURI(any: String): String = any match {
      case _ => "error"
    }

    /** load an HTML page from public/html */
    def loadPublicHTML(any: String) = Action {
      val projectRoot = Play.application().path()
      val file = new File(projectRoot + getURI(any))
      if (file.exists())
        Ok(scala.io.Source.fromFile(file.getCanonicalPath()).mkString).as("text/html");
      else
        NotFound
    }

  val routeCache = {
    val jsRoutesClass = classOf[routes.javascript]
    val controllers = jsRoutesClass.getFields.map(_.get(null))
    controllers.flatMap { controller =>
      controller.getClass.getDeclaredMethods.map { action =>
        action.invoke(controller).asInstanceOf[play.core.Router.JavascriptReverseRoute]
      }
    }
  }

  /**
   * Returns the JavaScript router that the client can use for "type-safe" routes.
   * Uses browser caching; set duration (in seconds) according to your release cycle.
   * @param varName The name of the global variable, defaults to `jsRoutes`
   */
  def jsRoutes(varName: String = "jsRoutes") = Cached(_ => "jsRoutes", duration = 86400) {
    Action { implicit request =>
      Ok(Routes.javascriptRouter(varName)(routeCache: _*)).as(JAVASCRIPT)
    }
  }
}
