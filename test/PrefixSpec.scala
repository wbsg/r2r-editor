/**
 * Created with IntelliJ IDEA.
 * User: andreas
 * Date: 10/29/12
 * Time: 4:29 PM
 * To change this template use File | Settings | File Templates.
 */

import models.PrefixDefinition
import org.specs2.mutable.Specification
import play.api.test._
import play.api.test.Helpers._

class PrefixSpec extends Specification {
  "Prefix model" should {

    "create a new prefix" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        PrefixDefinition.createPrefixDefinition("owl", "http://www.w3.org/2002/07/owl#") must equalTo(true)
        PrefixDefinition.prefixExists("owl") must equalTo(true)
        PrefixDefinition.prefixExists("rdfs") must not equalTo(true)
      }
    }

    "create and retrieve prefixes" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        PrefixDefinition.createPrefixDefinition("owl", "http://www.w3.org/2002/07/owl#")
        PrefixDefinition.createPrefixDefinition("rdfs", "http://www.w3.org/2000/01/rdf-schema#")
        PrefixDefinition.allPrefixes().length must equalTo(4)//r2r and mp prefixes are inserted by default
        PrefixDefinition.allPrefixes().filter(_.prefix=="owl").map(_.namespace must equalTo("http://www.w3.org/2002/07/owl#"))
      }
    }

    "overwrite existing prefixing" in  {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        PrefixDefinition.createPrefixDefinition("owl", "http://www.w3.org/2002/07/owl#")
        PrefixDefinition.createPrefixDefinition("rdfs", "http://www.w3.org/2000/01/rdf-broken#") must equalTo (true)
        PrefixDefinition.createPrefixDefinition("rdfs", "http://www.w3.org/2000/01/rdf-schema#") must equalTo (true)
        PrefixDefinition.allPrefixes().length must equalTo(4)//r2r and mp prefixes are inserted by default
        PrefixDefinition.allPrefixes().filter(_.prefix=="rdfs").map(_.namespace must equalTo("http://www.w3.org/2000/01/rdf-schema#"))
      }
    }
  }
}
