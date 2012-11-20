package models

import play.api.db.DB
import play.api.Play.current
import anorm._
import anorm.SqlParser._
import util.Random

/**
 * Created with IntelliJ IDEA.
 * User: andreas
 * Date: 10/19/12
 * Time: 12:48 PM
 * To change this template use File | Settings | File Templates.
 */
case class User(email: String, password: String, salt: Long)

object User {
  val simple = {
    get[String]("user.email")~
    get[String]("user.password")~
    get[Long]("user.salt") map {
      case email ~ password ~ salt => User(email, password, salt)
    }
  }

  /**
   * Create a new User in the system.
   * @param email
   * @param password
   * @return None if creation failed, Some(userID) if successful
   */
  def createUser(email: String, password: String): Boolean = {
    val salt = generateSalt()
    val hashedPass = hashPassword(password, salt)
    try {
    DB.withConnection(implicit c =>
      SQL(
        """
              insert into user values({email}, {passwordHash}, {salt})
        """).on("email" -> email, "passwordHash" -> hashedPass, "salt" -> salt).executeUpdate()==1
    )
    } catch {
      case e: Exception => return false
    }
  }

  /**
   * Delete a user
   * @param email
   * @return True for success, false for failure
   */
  def deleteUser(email: String): Boolean = {
    DB.withConnection { implicit c =>
      SQL(
        """
          delete from user where email={email}
        """.stripMargin
      ).on("email" -> email).executeUpdate()==1
    }
  }

  /**
   * Check for user existence
   * @param email
   * @return
   */
  def userExists(email: String): Boolean = {
    DB.withConnection { implicit c =>
      val userCount =SQL(
        """
          select count(*) as c from user where email={email}
        """.stripMargin
      ).on("email" -> email).apply().head
      userCount[Long]("c")==1L
    }
  }

  /**
   * Get user if exists
   * @param email
   * @return
   */
  def findUserByEmail(email: String): Option[User] = {
    DB.withConnection { implicit c =>
      SQL(
        """
          select * from user where email={email}
        """.stripMargin
      ).on("email" -> email).as(User.simple.singleOpt)
    }
  }

  /**
   * Authenticate user
   * @param email User's email address
   * @param pass User's plain text password
   * @return
   */
  def authenticateUser(email: String, pass: String): Boolean = {
    findUserByEmail(email) match {
      case None => false
      case Some(user) => hashPassword(pass, user.salt)==user.password
    }
  }

  def hashPassword(password: String, salt: Long): String = {
    val md = java.security.MessageDigest.getInstance("SHA-256")
    md.update(salt.toString.getBytes)
    for(i <- 1 to 50)
      md.update(password.getBytes)
    val ha = new sun.misc.BASE64Encoder().encode(md.digest(password.getBytes))
    ha.toString
  }

  def generateSalt(): Long ={
    new Random(System.nanoTime()).nextLong()
  }

  def main(args: Array[String]) {
    println(hashPassword("paass", 3273872L))
  }
}
