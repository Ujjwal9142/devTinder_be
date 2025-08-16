const { check } = require("express-validator");
const userManagementController = require("../controllers/userManagement");
const con = require("../constants/index");
const common = require("../helpers/common");
const isUserAuthenticated = require("../middlewares/isAuth");

module.exports = (router) => {
  router.get(
    "/getUserByEmail",
    [check("email", con.accountManagement.INVALID_EMAIL).isEmail()],
    isUserAuthenticated,
    userManagementController.getUserByEmail
  );

  router.post(
    "/feed",
    [
      check("pageNumber")
        .exists()
        .withMessage(con.userManagement.PAGE_NUMBER_REQUIRED)
        .isInt({ min: 1 })
        .withMessage(con.userManagement.INVALID_PAGE_NUMBER),

      check("pageSize")
        .optional()
        .isIn([10, 25, 50, 100])
        .withMessage(con.userManagement.INVALID_PAGE_SIZE),
    ],
    isUserAuthenticated,
    userManagementController.feed
  );

  router.delete(
    "/deleteUser",
    [
      check("userId").custom((value) => {
        if (!common.isValidMongoId(value)) {
          const error = new Error(con.userManagement.INVALID_USER_ID);
          throw error;
        }
        return true;
      }),
    ],
    isUserAuthenticated,
    userManagementController.deleteUser
  );

  router.patch(
    "/updateUser",
    [
      check("userId").custom((value) => {
        if (!common.isValidMongoId(value)) {
          const error = new Error(con.userManagement.INVALID_USER_ID);
          throw error;
        }
        return true;
      }),
      check("firstName", con.accountManagement.FIRST_NAME)
        .isString()
        .trim()
        .isLength({ min: 3, max: 30 }),
      check("lastName", con.accountManagement.LAST_NAME)
        .isString()
        .trim()
        .isLength({ min: 3, max: 30 }),
      check("gender", con.accountManagement.GENDER_ERROR).isIn(["male", "female", "other"]),
      check("email", con.accountManagement.INVALID_EMAIL).isEmail(),
      check("dob").isISO8601().withMessage(con.accountManagement.INVALID_DOB),
      check("about", con.accountManagement.INVALID_ABOUT)
        .optional()
        .isString()
        .trim()
        .isLength({ min: 0, max: 100 }),
      check("imageUrl", con.accountManagement.INVALID_IMAGE).optional().isString().trim(),
      check("skills", con.accountManagement.SKILLS).optional().isArray(),
      check("skills.*", con.accountManagement.SKILL).isString(),
    ],
    isUserAuthenticated,
    userManagementController.updateUser
  );
};
