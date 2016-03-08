// @SOURCE:/Users/laldinglianat/projects/crpt-ui/conf/routes
// @HASH:7a9a74303d1d89ae6335cc2ea023709468fb1333
// @DATE:Fri Mar 04 12:31:13 GMT+05:30 2016

import Routes.{prefix => _prefix, defaultPrefix => _defaultPrefix}
import play.core._
import play.core.Router._
import play.core.Router.HandlerInvokerFactory._
import play.core.j._

import play.api.mvc._
import _root_.controllers.Assets.Asset

import Router.queryString


// @LINE:15
// @LINE:11
// @LINE:8
// @LINE:6
package controllers {

// @LINE:11
class ReverseAssets {


// @LINE:11
def versioned(file:Asset): Call = {
   implicit val _rrc = new ReverseRouteContext(Map(("path", "/public")))
   Call("GET", _prefix + { _defaultPrefix } + "assets/" + implicitly[PathBindable[Asset]].unbind("file", file))
}
                        

}
                          

// @LINE:15
// @LINE:8
// @LINE:6
class ReverseApplication {


// @LINE:15
// @LINE:6
def index(any:String): Call = {
   (any: @unchecked) match {
// @LINE:6
case (any) if any == "none" =>
  implicit val _rrc = new ReverseRouteContext(Map(("any", "none")))
  Call("GET", _prefix)
                                         
// @LINE:15
case (any)  =>
  import ReverseRouteContext.empty
  Call("GET", _prefix + { _defaultPrefix } + implicitly[PathBindable[String]].unbind("any", any))
                                         
   }
}
                                                

// @LINE:8
def jsRoutes(): Call = {
   import ReverseRouteContext.empty
   Call("GET", _prefix + { _defaultPrefix } + "jsroutes.js")
}
                        

}
                          
}
                  


// @LINE:15
// @LINE:11
// @LINE:8
// @LINE:6
package controllers.javascript {
import ReverseRouteContext.empty

// @LINE:11
class ReverseAssets {


// @LINE:11
def versioned : JavascriptReverseRoute = JavascriptReverseRoute(
   "controllers.Assets.versioned",
   """
      function(file) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "assets/" + (""" + implicitly[PathBindable[Asset]].javascriptUnbind + """)("file", file)})
      }
   """
)
                        

}
              

// @LINE:15
// @LINE:8
// @LINE:6
class ReverseApplication {


// @LINE:15
// @LINE:6
def index : JavascriptReverseRoute = JavascriptReverseRoute(
   "controllers.Application.index",
   """
      function(any) {
      if (any == """ + implicitly[JavascriptLitteral[String]].to("none") + """) {
      return _wA({method:"GET", url:"""" + _prefix + """"})
      }
      if (true) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("any", any)})
      }
      }
   """
)
                        

// @LINE:8
def jsRoutes : JavascriptReverseRoute = JavascriptReverseRoute(
   "controllers.Application.jsRoutes",
   """
      function() {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "jsroutes.js"})
      }
   """
)
                        

}
              
}
        


// @LINE:15
// @LINE:11
// @LINE:8
// @LINE:6
package controllers.ref {


// @LINE:11
class ReverseAssets {


// @LINE:11
def versioned(path:String, file:Asset): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   controllers.Assets.versioned(path, file), HandlerDef(this.getClass.getClassLoader, "", "controllers.Assets", "versioned", Seq(classOf[String], classOf[Asset]), "GET", """ Map static resources from the /public folder to the /assets URL path""", _prefix + """assets/$file<.+>""")
)
                      

}
                          

// @LINE:15
// @LINE:8
// @LINE:6
class ReverseApplication {


// @LINE:6
def index(any:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   controllers.Application.index(any), HandlerDef(this.getClass.getClassLoader, "", "controllers.Application", "index", Seq(classOf[String]), "GET", """ Home page""", _prefix + """""")
)
                      

// @LINE:8
def jsRoutes(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   controllers.Application.jsRoutes(), HandlerDef(this.getClass.getClassLoader, "", "controllers.Application", "jsRoutes", Seq(), "GET", """""", _prefix + """jsroutes.js""")
)
                      

}
                          
}
        
    