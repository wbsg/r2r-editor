/**
 * Created with IntelliJ IDEA.
 * User: andreas
 * Date: 10/19/12
 * Time: 12:43 PM
 * To change this template use File | Settings | File Templates.
 */

import models.User
import org.specs2.mutable.Specification
import play.api.test._
import play.api.test.Helpers._

class UserSpec extends Specification {
  "User model" should {

    "create a new user" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
          User.createUser("john@doe.org", "myPass") must equalTo(true)
          User.createUser("john@smith.org", "myPass2") must equalTo(true)

      }
    }

    "fail on creating two users with the same email address" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        User.createUser("john@doe.org", "myPass")
        User.createUser("john@doe.org", "myPass2") must not be equalTo(true)
      }
    }

    "contain a user after creation" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        User.createUser("john@doe.org", "myPass")
        User.userExists("john@doe.org") must equalTo(true)
      }
    }

    "must not contain a user after creation" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        User.createUser("john@doe.org", "myPass")
        User.userExists("john@doe.org") must equalTo(true)
      }
    }

    "be able to delete existing users" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        User.createUser("john@doe.org", "myPass")
        User.userExists("john@doe.org") must equalTo(true)
        User.deleteUser("john@doe.org")
        User.userExists("john@doe.org") must not equalTo(true)

      }
    }

    "not contain a user that is not created" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        User.userExists("john@smith.org") must not equalTo(true)
      }
    }

    "retrieve existing users" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        User.createUser("john@doe.org", "myPass")
        User.findUserByEmail("john@doe.org").getOrElse(User("","",0L)).email must equalTo("john@doe.org")
      }
    }

    "authenticate existing users" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        User.createUser("john@doe.org", "myPass")
        User.authenticateUser("john@doe.org", "myPass") must equalTo(true)
        User.authenticateUser("john@doe.org", "myPazz") must not equalTo(true)
      }
    }
  }
}