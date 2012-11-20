package controllers

import play.api._
import libs.json._
import libs.json.JsObject
import libs.json.JsString
import play.api.mvc._
import models.{R2RParser, Vocabulary, PrefixDefinition, Mapping}
import models.Mapping.MappingReads
import java.util.concurrent.ExecutionException
import models.R2RParser.{ParseResult, ParseResultWrites}
import scala.Some

object Application extends Controller {
  
  def index = Action {
    Redirect(routes.Application.r2r)
  }

  def r2r = Action {
    Ok(views.html.r2r())
  }

  def vocabulary(vocURL: String) = Action {
    try {
      Ok(Vocabulary.getRDFData(vocURL))
    } catch {
      case e: ExecutionException => BadRequest("No RDF data at URL: " + vocURL)
      case e: SecurityException => BadRequest("Access to local domains, network and resources prohibited: " + vocURL)
      case e: IllegalArgumentException => BadRequest("Bad vocabulary request: " + e.getMessage)
    }
  }

  def mappings = Action { request =>
    val prefixDef = PrefixDefinition.getPrefix("mp")
    if(prefixDef==None)
      InternalServerError("Prefix 'mp' is not set. Please define it.")
    else {
      val mappings = Mapping.allMappings(prefixDef.get.namespace)
      if(request.headers.get("Accept")==Some("application/json"))
        Ok(Json.toJson(mappings))
      else {
        val (mappingCollectionURI, prefixes) = PrefixDefinition.createPrefixDefinitionsRDFEntity(PrefixDefinition.allPrefixes())
        val prefixString = prefixes.map(_.toNTripleFormat + " .").mkString("\n")
        val mappingAsNT = (for(mapping <- mappings)
          yield Mapping.convertToNTriples(mapping, Some(mappingCollectionURI))).flatten.mkString("")
        Ok(prefixString+"\n"+mappingAsNT).withHeaders("Content-Type" -> "application/turtle")
      }
    }
  }

  def getMapping(name: String) = Action { request =>
    val prefixDef = PrefixDefinition.getPrefix("mp")
    if(prefixDef==None)
      InternalServerError("Prefix 'mp' is not set. Please define it.")
    val mappings = Mapping.allMappings(prefixDef.get.namespace).filter(_.uri.endsWith(name)) //TODO: Implement something more efficient
    if(mappings.size<1)
      NotFound("Mapping not found.")
    else {
      if(request.headers.get("Accept")==Some("application/json"))
        Ok(Json.toJson(mappings))
      else {
        val mapping = mappings.head
        val prefixes = PrefixDefinition.createPrefixDefinitionsTriple(mapping.uri, PrefixDefinition.allPrefixes())
        val prefixString = prefixes.map(_.toNTripleFormat + " .").mkString("\n")
        val mappingAsNT = Mapping.convertToNTriples(mapping).flatten.mkString("")
        Ok(prefixString+"\n"+mappingAsNT).withHeaders("Content-Type" -> "application/turtle")
      }
    }
  }

  def prefixes = Action {
    val prefixes = PrefixDefinition.allPrefixes()
    Ok(Json.toJson(prefixes))
  }

  def deletePrefix(prefix: String) = Action {
    try {
      val deleted = PrefixDefinition.deletePrefix(prefix)
      if (deleted)
        Ok("Prefix deleted")
      else
        NotFound("Prefix not found")
    } catch {
      case e: RuntimeException => BadRequest(e.getMessage + "\n" + e.getStackTraceString)
    }
  }

  def getPrefix(prefix: String) = Action {
    try {
      PrefixDefinition.getPrefix(prefix) match {
        case None => NotFound("Prefix " + prefix + " is not registered.")
        case Some(pd) => Ok(pd.namespace)
      }
    } catch {
      case e: RuntimeException => InternalServerError(e.getMessage)
    }
  }

  def savePrefixes = Action(parse.json) { request =>
    val prefixesJSON = request.body
    try {
      val prefixes = prefixesJSON.as[List[PrefixDefinition]]
      println(prefixes)
      PrefixDefinition.savePrefixDefinitions(prefixes)
      Ok("Prefixes saved")
    } catch {
      case e: RuntimeException => BadRequest(e.getMessage)
    }
  }

  def validateTransformation = Action(parse.json) { request =>
    val transformation = request.body
    try {
      val parseResult = R2RParser.parseTransformation(transformation.as[String])
      Ok(Json.toJson(parseResult))
    } catch {
      case e: RuntimeException => Ok(Json.toJson(ParseResult(false, "Unknown error while parsing")))
    }
  }

  def saveMapping = Action(parse.json) { request =>
    val mappingJSON = request.body
    try{
      val mapping = mappingJSON.as[Mapping]
      Mapping.saveMapping(mapping)
      Ok("Saved")
    } catch {
      case e: Exception => BadRequest(e.getMessage + "\n" + e.getStackTraceString)
    }
  }

  def deleteMapping(name: String) = Action { request =>
    try {
      Mapping.deleteMappingByUri(name)
      Ok("Deleted")
    } catch {
      case e: RuntimeException => BadRequest(e.getMessage)
    }
  }
}