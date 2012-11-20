import sbt._
import Keys._
import PlayProject._

object ApplicationBuild extends Build {

    val appName         = "r2r-editor"
    val appVersion      = "0.1"

  val appDependencies = Seq(
//    "org.apache.httpcomponents" % "httpclient" % "4.0.1"
//      "net.databinder.dispatch" % "dispatch-core_2.9.2" % "0.9.2"
      //"org.apache.any23" % "apache-any23" % "0.7.0-incubating"
    "org.antlr" % "antlr" % "3.2"
  )

    val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA).settings(
//      resolvers += "any23-repository" at "http://any23.googlecode.com/svn/repo",
//      resolvers += "any23-repository-external" at "http://any23.googlecode.com/svn/repo-ext"
    )

}
