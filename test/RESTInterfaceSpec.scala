package test


/**
 * Created with IntelliJ IDEA.
 * User: andreas
 * Date: 10/19/12
 * Time: 11:51 AM
 * To change this template use File | Settings | File Templates.
 */

import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._
import play.api.libs.json.Json

class RESTInterfaceSpec extends Specification {

  "REST interface" should {


    "redirect from /" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        val result = routeAndCall( FakeRequest( GET, "/")).get
        status(result) must equalTo(303)
      }
    }

    "PUT a new prefix" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        val resultR2RPrefix = routeAndCall( FakeRequest( GET, "/prefix/r2r")).get
        contentAsString(resultR2RPrefix) must equalTo("http://www4.wiwiss.fu-berlin.de/bizer/r2r/")
        val json = Json.parse("""[{"prefix": "mp2", "namespace": "http://mapping/"}]""")
        val result404 = routeAndCall( FakeRequest( GET, "/prefix/mp2").withHeaders(("Accept"->"application/json"))).get
        status(result404) must equalTo(404)
        val resultPut = routeAndCall( new FakeRequest( PUT, "/prefix", FakeHeaders(Map("Content-Type"->Seq("application/json"))), json)).get
        status(resultPut) must equalTo(200)
        val result200 = routeAndCall( FakeRequest( GET, "/prefix/mp2").withHeaders(("Accept"->"application/json"))).get
        status(result200) must equalTo(200)
        contentAsString(result200) must equalTo("http://mapping/")
      }
    }

  }

}