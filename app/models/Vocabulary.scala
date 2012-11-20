package models


import helper.Any23Helper
import java.net.{URI, InetAddress, URL}

/**
 * Created with IntelliJ IDEA.
 * User: andreas
 * Date: 11/2/12
 * Time: 2:52 PM
 * To change this template use File | Settings | File Templates.
 */


object Vocabulary {
  def getRDFData(documentUrl: String): String = {
    val checkThisUrl = new URI(documentUrl).toURL
    if(isLocalResource(checkThisUrl))
      throw new SecurityException("Trying to access local resource: " + checkThisUrl.toString)
    Any23Helper.extract(documentUrl)
  }

  private def isLocalResource(url: URL): Boolean = {
    if(url.getProtocol.toLowerCase=="file")
      return true
    val address = InetAddress.getByName(url.getHost)
    if(address.isSiteLocalAddress || address.isLoopbackAddress)
      return true
    return false
  }

  def main(args: Array[String]) {
    println(getRDFData("http://xmlns.com/foaf/0.1/"))
  }
}
