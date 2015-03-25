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
  "org.webjars" % "requirejs" % "2.1.14-1"
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
