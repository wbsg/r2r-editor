/**
 * Created with IntelliJ IDEA.
 * User: andreas
 * Date: 10/22/12
 * Time: 1:19 PM
 * To change this template use File | Settings | File Templates.
 */

import models.Mapping
import org.specs2.mutable.Specification
import play.api.test._
import play.api.test.Helpers._

class MappingSpec extends Specification {
  "Mapping model" should {

    "create a new mapping" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
//        Mapping.allMappings().size must be equalTo(0)
        Mapping.saveMapping(Mapping(1, "test", "?SUBJ a <o> .", List("?SUBJ a <o2> ."), None, None, true))
        Mapping.mappingExists("test") must be equalTo(true)
        Mapping.getIdsOfMappingUri("test") match {
          case Some(id) => id must equalTo(1)
          case _ => throw new RuntimeException("This case should never match")
        }
      }
    }

    "return all stored mappings correctly" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        Mapping.saveMapping(Mapping(0, "testMapping1", "?SUBJ a <o> .", List("?SUBJ a <o2> ."), None, None, true))
        Mapping.saveMapping(Mapping(0, "testMapping2", "?SUBJ a <o> .", List("?SUBJ a <o2> .", "?SUBJ a <o3> ."), Some(List("?c = ?SUBJ")), Some("testMapping1"), true))
        val mappings = Mapping.allMappings("")
        mappings.length must equalTo(2)
        mappings.filter(_.uri=="testMapping1").head match {
          case Mapping(_, uri, sP, tPs, tr, mR, iC) => (uri, sP, tPs, tr, mR, iC) must equalTo(("testMapping1", "?SUBJ a <o> .", List("?SUBJ a <o2> ."), None, None, true))
          case _ => throw new RuntimeException("This case should never match")
        }
        mappings.filter(_.uri=="testMapping2").head match {
          case Mapping(_, uri, sP, tPs, tr, mR, iC) => (uri, sP, tPs, tr, mR, iC) must equalTo(("testMapping2", "?SUBJ a <o> .", List("?SUBJ a <o2> .", "?SUBJ a <o3> ."), Some(List("?c = ?SUBJ")), Some("testMapping1"), true))
          case _ => throw new RuntimeException("This case should never match")
        }
        mappings.map(_.id).sortWith(_ < _) must equalTo(Seq(1,2))
      }
    }

    "delete mappings correctly" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        Mapping.saveMapping(Mapping(0, "testMapping1", "?SUBJ a <o> .", List("?SUBJ a <o2> ."), None, None, true))
        Mapping.saveMapping(Mapping(0, "testMapping2", "?SUBJ a <o> .", List("?SUBJ a <o2> .", "?SUBJ a <o3> ."), Some(List("?c = ?SUBJ")), Some("testMapping1"), true))
        Mapping.getAllTargetPatterns().size must equalTo(3)
        Mapping.getAllTransformations().size must equalTo(1)
        Mapping.deleteMappingByUri("testMapping2")
        Mapping.getAllTargetPatterns().size must equalTo(1)
        Mapping.getAllTransformations().size must equalTo(0)
        Mapping.allMappings("").size must equalTo(1)
        Mapping.deleteMappingByUri("testMapping1")
        Mapping.getAllTargetPatterns().size must equalTo(0)
        Mapping.getAllTransformations().size must equalTo(0)
        Mapping.allMappings("").size must equalTo(0)
      }
    }

    "overwrite existing mappings" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        Mapping.saveMapping(Mapping(0, "testMapping1", "?SUBJ a <o> .", List("?SUBJ a <o2> ."), None, None, true))
        Mapping.saveMapping(Mapping(0, "testMapping1", "?SUBJ a <o> .", List("?SUBJ a <o2> .", "?SUBJ a <o3> ."), Some(List("?c = ?SUBJ")), None, true))
        val mappings = Mapping.allMappings("")
        mappings.length must equalTo(1)
        mappings.filter(_.uri=="testMapping1").head match {
          case Mapping(_, uri, sP, tPs, tr, mR, iC) => (uri, sP, tPs, tr, mR, iC) must equalTo(("testMapping1", "?SUBJ a <o> .", List("?SUBJ a <o2> .", "?SUBJ a <o3> ."), Some(List("?c = ?SUBJ")), None, true))
          case _ => throw new RuntimeException("This case should never match")
        }
        mappings.map(_.id).sortWith(_ < _) must equalTo(Seq(2))
        Mapping.getAllTargetPatterns().size must equalTo(2)
        Mapping.getAllTransformations().size must equalTo(1)
      }
    }
  }
}
