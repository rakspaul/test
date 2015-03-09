import play.twirl.api.Html
import scala.io.Source

package helpers{
  
  object include {

    def apply(absolutePath: String): Html = {
      val source = Source.fromFile(absolutePath, "UTF-8").getLines().mkString("\n")
      Html(source)
    }
  } 
}
