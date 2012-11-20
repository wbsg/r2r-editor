package models

import play.api.db.DB
import play.api.Play.current
import anorm._
import anorm.SqlParser._
import play.api.libs.json._
import anorm.~
import play.api.libs.json.JsObject
import ldif.entity.Node
import de.fuberlin.wiwiss.r2r.R2R
import ldif.runtime.Triple
import ldif.util.Consts

/**
 * Created with IntelliJ IDEA.
 * User: andreas
 * Date: 10/29/12
 * Time: 4:17 PM
 * To change this template use File | Settings | File Templates.
 */
case class PrefixDefinition(prefix: String, namespace: String) {
  override def toString = prefix + ": <" + namespace + "> ."
}

object PrefixDefinition {
  val simple = {
    get[String]("prefixDefinition.prefix")~
    get[String]("prefixDefinition.namespace") map {
      case prefix ~ namespace => PrefixDefinition(prefix, namespace)
    }
  }

  def allPrefixes(): List[PrefixDefinition] = {
    DB.withConnection(implicit c =>
      SQL(
        """
          select * from prefixDefinition
        """.stripMargin).as(PrefixDefinition.simple *)
    )
  }

  def deletePrefix(prefix: String): Boolean = {
    if(prefix=="r2r" || prefix=="mp")
      return false
    DB.withConnection(implicit c =>
      SQL(
        """
          delete from prefixDefinition where prefix={prefix}
        """.stripMargin).on("prefix"->prefix).executeUpdate()==1
    )
  }

  def createPrefixDefinition(prefix: String, namespace: String): Boolean = {
    if(prefix=="r2r")//Cannot overwrite r2r prefix
      return false
    try {
      DB.withConnection(implicit c =>
        if(prefixExists(prefix)) {
          return SQL(
            """
              update prefixDefinition set namespace={namespace} where prefix={prefix}
            """.stripMargin).on("namespace" -> namespace, "prefix" -> prefix).executeUpdate()==1
        }
        else
          SQL(
            """
              insert into prefixDefinition values ({prefix}, {namespace})
            """.stripMargin).on("namespace" -> namespace, "prefix" -> prefix).executeUpdate()==1
      )
    } catch {
      case e: RuntimeException => return false
    }
  }

  def savePrefixDefinitions(prefixDefs: List[PrefixDefinition]): Boolean = {
    try {
      DB.withTransaction(implicit c =>
        for(prefixDef <- prefixDefs)
          createPrefixDefinition(prefixDef.prefix, prefixDef.namespace)
      )
      true
    } catch {
      case e: RuntimeException => return false
    }
  }

  def prefixExists(prefix: String): Boolean = {
    DB.withConnection { implicit c =>
      val res = SQL("""
        select * from prefixDefinition where prefix={prefix}
          """)
        .on("prefix" -> prefix)
        .apply()
      return res.length==1
    }
  }

  def getPrefix(prefix: String): Option[PrefixDefinition] = {
    DB.withConnection { implicit c =>
      SQL(
        """
          select * from prefixDefinition where prefix={prefix}
        """.stripMargin).on("prefix" -> prefix).as(PrefixDefinition.simple.singleOpt)
    }
  }

  implicit object PrefixDefinitionWrite extends Writes[PrefixDefinition] {
    def writes(o: PrefixDefinition) = JsObject(List(
      "prefix" -> JsString(o.prefix),
      "namespace" -> JsString(o.namespace)
    ))
  }

  implicit object PrefixDefinitionReads extends Reads[PrefixDefinition] {
    def reads(json: JsValue) = PrefixDefinition(
      (json \ "prefix").as[String],
      (json \ "namespace").as[String]
    )
  }

  def createPrefixDefinitionsRDFEntity(prefixes: Seq[PrefixDefinition]): (Node, Seq[Triple]) = {
    val prefixString = prefixes.map(_.toString()).mkString(" ")
    val uri = "http://ldif.wbsg.de/r2r/mappingCollection/" + System.nanoTime()
    val uriNode = Node.createUriNode(uri)
    var triples = List[Triple](Triple(uriNode, R2R.prefixDefinitions, Node.createLiteral(prefixString)))
    triples ::= Triple(uriNode, Consts.RDFTYPE_URI, Node.createUriNode(R2R.MappingCollection))
    (uriNode, triples)
  }

  def createPrefixDefinitionsTriple(uri: String, prefixes: Seq[PrefixDefinition]): Seq[Triple] = {
    val prefixString = prefixes.map(_.toString()).mkString(" ")
    val uriNode = Node.createUriNode(uri)
    List(Triple(uriNode, R2R.prefixDefinitions, Node.createLiteral(prefixString)))
  }
}
