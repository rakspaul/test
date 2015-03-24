import WebKeys._
import com.typesafe.sbt.web.SbtWeb.autoImport._
import com.typesafe.sbt.less.Import.LessKeys
name := "crpt-ui"

version := "1.0-SNAPSHOT"

scalaVersion := "2.11.4"

lazy val root = (project in file(".")).enablePlugins(PlayScala,SbtWeb)

libraryDependencies ++= Seq(
  filters,
  anorm,
  cache,
  "org.webjars" % "requirejs" % "2.1.14-1",
  "org.webjars" % "underscorejs" % "1.6.0-3",
  "org.webjars" % "jquery" % "1.11.1",
  "org.webjars" % "bootstrap" % "3.1.1-2" exclude("org.webjars", "jquery"),
  "org.webjars" % "angularjs" % "1.2.18" exclude("org.webjars", "jquery"), 
  "org.webjars" % "angular-cache" % "3.2.4" exclude("org.webjars", "jquery"), 
  "org.webjars" % "angular-sanitize" % "1.3.11" exclude("org.webjars", "jquery") 
)     

//scalacOptions in ThisBuild ++= Seq(
//  "-target:jvm-1.7",
//  "-encoding", "UTF-8",
//  "-deprecation", // warning and location for usages of deprecated APIs
//  "-feature", // warning and location for usages of features that should be imported explicitly
//  "-unchecked", // additional warnings where generated code depends on assumptions
//  "-Xlint", // recommended additional warnings
//  "-Ywarn-adapted-args", // Warn if an argument list is modified to match the receiver
//  "-Ywarn-value-discard", // Warn when non-Unit expression results are unused
//  "-Ywarn-inaccessible",
//  "-Ywarn-dead-code"
//)

pipelineStages := Seq(rjs, digest, gzip)

// RequireJS with sbt-rjs (https://github.com/sbt/sbt-rjs#sbt-rjs)
// ~~~
RjsKeys.paths += ("jsRoutes" -> ("/jsroutes" -> "empty:"))
RjsKeys.generateSourceMaps := false
includeFilter in (Assets, LessKeys.less) := "*.less"
excludeFilter in (Assets, LessKeys.less) := "_*.less"

// for minified *.min.css files
LessKeys.compress := true
//play.Project.playScalaSettings
