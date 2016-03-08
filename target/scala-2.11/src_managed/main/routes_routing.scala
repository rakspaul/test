// @SOURCE:/Users/laldinglianat/projects/crpt-ui/conf/routes
// @HASH:7a9a74303d1d89ae6335cc2ea023709468fb1333
// @DATE:Fri Mar 04 12:31:13 GMT+05:30 2016


import play.core._
import play.core.Router._
import play.core.Router.HandlerInvokerFactory._
import play.core.j._

import play.api.mvc._
import _root_.controllers.Assets.Asset

import Router.queryString

object Routes extends Router.Routes {

import ReverseRouteContext.empty

private var _prefix = "/"

def setPrefix(prefix: String) {
  _prefix = prefix
  List[(String,Routes)]().foreach {
    case (p, router) => router.setPrefix(prefix + (if(prefix.endsWith("/")) "" else "/") + p)
  }
}

def prefix = _prefix

lazy val defaultPrefix = { if(Routes.prefix.endsWith("/")) "" else "/" }


// @LINE:6
private[this] lazy val controllers_Application_index0_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix))))
private[this] lazy val controllers_Application_index0_invoker = createInvoker(
controllers.Application.index(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "", "controllers.Application", "index", Seq(classOf[String]),"GET", """ Home page""", Routes.prefix + """"""))
        

// @LINE:8
private[this] lazy val controllers_Application_jsRoutes1_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("jsroutes.js"))))
private[this] lazy val controllers_Application_jsRoutes1_invoker = createInvoker(
controllers.Application.jsRoutes(),
HandlerDef(this.getClass.getClassLoader, "", "controllers.Application", "jsRoutes", Nil,"GET", """""", Routes.prefix + """jsroutes.js"""))
        

// @LINE:11
private[this] lazy val controllers_Assets_versioned2_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("assets/"),DynamicPart("file", """.+""",false))))
private[this] lazy val controllers_Assets_versioned2_invoker = createInvoker(
controllers.Assets.versioned(fakeValue[String], fakeValue[Asset]),
HandlerDef(this.getClass.getClassLoader, "", "controllers.Assets", "versioned", Seq(classOf[String], classOf[Asset]),"GET", """ Map static resources from the /public folder to the /assets URL path""", Routes.prefix + """assets/$file<.+>"""))
        

// @LINE:15
private[this] lazy val controllers_Application_index3_route = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),DynamicPart("any", """.+""",false))))
private[this] lazy val controllers_Application_index3_invoker = createInvoker(
controllers.Application.index(fakeValue[String]),
HandlerDef(this.getClass.getClassLoader, "", "controllers.Application", "index", Seq(classOf[String]),"GET", """ Redirect all unknown routes to the index page""", Routes.prefix + """$any<.+>"""))
        
def documentation = List(("""GET""", prefix,"""controllers.Application.index(any:String = "none")"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """jsroutes.js""","""controllers.Application.jsRoutes()"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """assets/$file<.+>""","""controllers.Assets.versioned(path:String = "/public", file:Asset)"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """$any<.+>""","""controllers.Application.index(any:String)""")).foldLeft(List.empty[(String,String,String)]) { (s,e) => e.asInstanceOf[Any] match {
  case r @ (_,_,_) => s :+ r.asInstanceOf[(String,String,String)]
  case l => s ++ l.asInstanceOf[List[(String,String,String)]]
}}
      

def routes:PartialFunction[RequestHeader,Handler] = {

// @LINE:6
case controllers_Application_index0_route(params) => {
   call(Param[String]("any", Right("none"))) { (any) =>
        controllers_Application_index0_invoker.call(controllers.Application.index(any))
   }
}
        

// @LINE:8
case controllers_Application_jsRoutes1_route(params) => {
   call { 
        controllers_Application_jsRoutes1_invoker.call(controllers.Application.jsRoutes())
   }
}
        

// @LINE:11
case controllers_Assets_versioned2_route(params) => {
   call(Param[String]("path", Right("/public")), params.fromPath[Asset]("file", None)) { (path, file) =>
        controllers_Assets_versioned2_invoker.call(controllers.Assets.versioned(path, file))
   }
}
        

// @LINE:15
case controllers_Application_index3_route(params) => {
   call(params.fromPath[String]("any", None)) { (any) =>
        controllers_Application_index3_invoker.call(controllers.Application.index(any))
   }
}
        
}

}
     