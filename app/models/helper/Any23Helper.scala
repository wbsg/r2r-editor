package models.helper

/**
 * Created with IntelliJ IDEA.
 * User: andreas
 * Date: 11/5/12
 * Time: 12:54 PM
 * To change this template use File | Settings | File Templates.
 */

import org.apache.any23._
import source.HTTPDocumentSource
import java.io.ByteArrayOutputStream
import writer._

object Any23Helper {
  def main(args: Array[String]) {
    println(extract("http://dbpedia.org/ontology/slogan"))
  }

  def extract(uri: String): String = {
    val any23 = new Any23()
    any23.setHTTPUserAgent("LDIF R2R Editor")
    val httpClient = any23.getHTTPClient();
    val source = new HTTPDocumentSource(httpClient, uri)
    val out = new ByteArrayOutputStream()
    val handler = new NTriplesWriter(out);
    try {
      any23.extract(source, handler)
    } finally {
      handler.close()
    }
    val result = out.toString("UTF-8").toString
    return result
  }
}
