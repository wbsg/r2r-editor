package models

import play.api.db.DB
import play.api._
import play.api.Play.current
import anorm._
import anorm.SqlParser._
import play.api.libs.json._
import anorm.~
import play.api.libs.json.JsArray
import play.api.libs.json.JsObject
import scala.Some
import collection.mutable.ArrayBuffer
import ldif.runtime.{Quad, Triple}
import ldif.entity.Node
import ldif.util.Consts
import de.fuberlin.wiwiss.r2r.{FunctionExecution, FunctionMapper, BasicFunctionManager, R2R}

/**
 * Created with IntelliJ IDEA.
 * User: andreas
 * Date: 10/12/12
 * Time: 4:00 PM
 * To change this template use File | Settings | File Templates.
 */

case class PartialMapping(id: Long, uri: String, sourcePattern: String, mappingRef: Option[String], isClassMapping: Boolean)

case class TargetPattern(id: Long, mappingId: Long, value: String)

case class Transformation(id: Long, mappingId: Long, value: String)

case class Mapping(id: Long, uri: String, sourcePattern: String, targetPatterns: List[String], transformations: Option[List[String]], mappingRef: Option[String], isClassMapping: Boolean) {
  def this(partialMapping: PartialMapping, targetPatterns: List[String], transformations: Option[List[String]]) {
    this(partialMapping.id, partialMapping.uri, partialMapping.sourcePattern, targetPatterns, transformations, partialMapping.mappingRef, partialMapping.isClassMapping)
  }
}

object R2RParser {
  val functionManager = new BasicFunctionManager()
  var functionMapper = new FunctionMapper()

  def parseTransformation(transformationString: String): ParseResult = {
    try {
      FunctionExecution.parseTransformation(transformationString, functionManager, functionMapper)
      ParseResult(true, "Parsing succeeded")
    } catch {
      case e: Exception => ParseResult(false, "Error parsing transformation string: "+ e.getMessage)
    }
  }

  case class ParseResult(success: Boolean, message: String)

  implicit object ParseResultWrites extends Writes[ParseResult] {
    def writes(parseResult: ParseResult) = JsObject(List(
      "success" -> JsBoolean(parseResult.success),
      "message" -> JsString(parseResult.message)
    ))
  }
}

object PartialMapping {
  /**
   * Parse a PartialMapping form ResultSet
   */
  val simple = {
    get[Long]("mapping.id") ~
    get[String]("mapping.uri") ~
    get[String]("mapping.sourcePattern") ~
    get[Option[String]]("mapping.mappingRef") ~
    get[Boolean]("mapping.isClassMapping") map {
      case idmap ~ uri ~ sP ~ mappingRef ~ isClassMapping => PartialMapping(
        idmap, uri, sP, mappingRef, isClassMapping
      )
    }
  }
}

object TargetPattern {
  val simple = {
    get[Long]("targetpattern.id") ~
    get[Long]("targetpattern.mappingFk") ~
    get[String]("targetpattern.value") map {
      case id ~ mapId ~ targetPattern => TargetPattern(
        id, mapId, targetPattern
      )
    }
  }
}

object Transformation {
  val simple = {
    get[Long]("transformation.id") ~
    get[Long]("transformation.mappingFk") ~
    get[String]("transformation.value") map {
      case id ~ mapId ~ transformation => Transformation(
        id, mapId, transformation
      )
    }
  }

  def validate(transformationString: String): Boolean = {
    true
  }
}

object Mapping {
//  def apply(partialMapping: PartialMapping, targetPatterns: List[String], transformations: Option[List[String]]) = new Mapping(partialMapping, targetPatterns, transformations)

  /**
   *
   * @param mapping Mapping object
   * @return true on success, false on fail
   */
  def saveMapping(mapping: Mapping): Boolean = {
    if (mappingExists(mapping.uri)) {
      DB.withTransaction { implicit c =>
        val mappingId = SQL(
          """
            select id from mapping where uri={uri}
          """.stripMargin).on("uri" -> mapping.uri).as(get[Long]("id").singleOpt)
        mappingId match {
          case Some(id) => deleteMappingByUri(mapping.uri)
            saveMapping(mapping)
          case None => return false
        }
      }
      true
    } else {
      DB.withTransaction {implicit c =>
        // Insert partial mapping
        val mappingId = SQL(
          """
            insert into mapping values(null, {mappingUri}, {sourcePattern}, {mappingRef}, {isClassMapping})
          """).on("mappingUri" -> mapping.uri, "sourcePattern" -> mapping.sourcePattern, "mappingRef" -> mapping.mappingRef, "isClassMapping" -> mapping.isClassMapping)
          .executeInsert() match {
          case Some(key) => key
          case None => return false
          }
        // Insert target patterns
        for (targetPattern <- mapping.targetPatterns)
          SQL(
            """
              insert into targetpattern values(null, {mappingFk}, {targetPattern})
            """.stripMargin
          ).on("mappingFk" -> mappingId, "targetPattern" -> targetPattern).executeInsert()
        mapping.transformations match {
          case None =>
          case Some(transformations) => for (transformation <- transformations)
            SQL(
              """
                insert into transformation values(null, {mappingFk}, {transformation})
              """
            ).on("mappingFk" -> mappingId, "transformation" -> transformation).executeInsert()
        }
      }
      true
    }
  }

  def deleteMappingByUri(uri: String): Boolean = {
    DB.withTransaction { implicit c =>
      SQL(
        """
          delete from mapping where uri={uri}
        """.stripMargin
      ).on("uri" -> uri).executeUpdate()>1

    }
  }

  def getAllTargetPatterns(): Seq[TargetPattern] = {
    DB.withConnection { implicit c =>
      SQL(
        """
          select * from targetpattern
        """.stripMargin).as(TargetPattern.simple *)
    }
  }

  def getAllTransformations(): Seq[Transformation] = {
    DB.withConnection { implicit c =>
      SQL(
        """
          select * from transformation
        """.stripMargin).as(Transformation.simple *)
    }
  }

  def getIdsOfMappingUri(uri: String): Option[Long] = {
    DB.withConnection { implicit c =>
      SQL(
        """
          select mapping.id from mapping where mapping.uri={uri}
        """.stripMargin).on("uri" -> uri).as(long("id").singleOpt)
    }
  }

  def mappingExists(mapping: Mapping): Boolean = {
    DB.withConnection { implicit c =>
      SQL("""
        select id from mapping where uri={mappingURI}
          """)
        .on("mappingURI" -> mapping.id)
        .apply().length>0
    }
  }

  def mappingExists(mappingURI: String): Boolean = {
    DB.withConnection { implicit c =>
      SQL("""
        select id from mapping where uri={mappingURI}
          """)
        .on("mappingURI" -> mappingURI)
        .apply().length>0
    }
  }

  def allMappings(mappingPrefix: String): List[Mapping] = {
    val partialMappings = getPartialMappings()
    val targetPatterns = getTargetPatterns()
    val transformations = getTransformations()
    (for (pm <- partialMappings)
      yield new Mapping(pm.id, mappingPrefix+pm.uri, pm.sourcePattern, targetPatterns(pm.id), transformations.get(pm.id), pm.mappingRef, pm.isClassMapping)).toList
  }

  private def getPartialMappings(): Seq[PartialMapping] = {
    DB.withConnection { implicit c =>
      SQL("""
        select * from mapping
          """)
        .as(PartialMapping.simple *)
    }
  }

  private def getTargetPatterns(): Map[Long, List[String]] = {
    DB.withConnection { implicit c =>
      SQL("""
        select targetpattern.id, targetpattern.mappingFk, targetpattern.value from mapping join targetpattern on mapping.id = targetpattern.mappingFk
          """)
        .as(TargetPattern.simple *).groupBy(_.mappingId).mapValues(_.map(_.value))
    }
  }

  private def getTransformations(): Map[Long, List[String]] = {
    DB.withConnection { implicit c =>
      SQL("""
        select transformation.id, transformation.mappingFk, transformation.value from mapping join transformation on mapping.id = transformation.mappingFk
          """)
        .as(Transformation.simple *).groupBy(_.mappingId).mapValues(_.map(_.value))
    }
  }

  implicit object MappingWrites extends Writes[Mapping] {
    override def writes(mapping: Mapping) = JsObject(List(
      "uri" -> JsString(mapping.uri),
      "type" -> JsString(if (mapping.isClassMapping) "class" else "property"),
      "sourcePattern" -> JsString(mapping.sourcePattern),
      "targetPattern" -> JsArray(mapping.targetPatterns.map(JsString(_))),
      "transformation" -> JsArray(mapping.transformations.getOrElse(List()).map(JsString(_))),
      "mappingRef" -> getMappingRef(mapping)
    ))
  }

  def getMappingRef(mapping: Mapping): JsValue = {
    mapping.mappingRef match {
      case None => JsNull
      case Some(mappingRef) => JsString(mappingRef)
    }
  }

  implicit object MappingReads extends Reads[Mapping] {
    def reads(json: JsValue) = Mapping(
      0,
      (json \ "uri").as[String],
      (json \ "sourcePattern").as[String],
      (json \ "targetPattern").as[List[String]],
      (json \ "transformation").as[Option[List[String]]],
      (json \ "mappingRef").as[Option[String]],
      (json \ "type").as[String] match {
        case "class" => true
        case _ => false
      }
    )
  }

  def convertToNTriples(mapping: Mapping, mappingCollection: Option[Node] = None): Seq[String] = {
    val triples = new ArrayBuffer[Quad]()
    implicit val uri = Node.createUriNode(mapping.uri)
    triples.append(typeTriple(mapping))
    if(mapping.mappingRef!=None)
      triples.append(mappingRefTriple(mapping.mappingRef.get))
    triples.append(sourcePatternTriple(mapping.sourcePattern))
    triples.appendAll(targetPatternTriples(mapping.targetPatterns))
    if(mapping.transformations!=None)
      triples.appendAll(targetPatternTriples(mapping.transformations.get))
    if(mappingCollection!=None)
      triples.append(Triple(uri, R2R.partOfMappingCollection, mappingCollection.get))
    triples.map(_.toNTripleFormat + " .\n")
  }

  private def mappingRefTriple(mappingRef: String)(implicit uri: Node): Triple = {
    Triple(uri, R2R.mappingRef, Node.createUriNode(mappingRef))
  }

  private def targetPatternTriples(targetPatterns: Seq[String])(implicit uri: Node): Seq[Quad] = {
    for(targetPattern <- targetPatterns)
      yield Triple(uri, R2R.targetPattern, Node.createLiteral(targetPattern))
  }

  private def transformationTriples(transformations: Seq[String])(implicit uri: Node): Seq[Quad] = {
    for(transformation <- transformations)
      yield Triple(uri, R2R.transformation, Node.createLiteral(transformation))
  }

  private def sourcePatternTriple(sourcePattern: String)(implicit uri: Node): Triple = {
    Triple(uri, R2R.sourcePattern, Node.createLiteral(sourcePattern))
  }

  private def typeTriple(mapping: Mapping)(implicit uri: Node): Triple = {
    mapping.isClassMapping match {
      case true => Triple(uri, Consts.RDFTYPE_URI, Node.createUriNode(R2R.ClassMapping))
      case false => Triple(uri, Consts.RDFTYPE_URI, Node.createUriNode(R2R.PropertyMapping))
    }
  }
}
