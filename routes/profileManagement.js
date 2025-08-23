const { check } = require("express-validator");
const profileManagementController = require("../controllers/profileManagement");
const con = require("../constants/index");
const common = require("../helpers/common");
const isUserAuthenticated = require("../middlewares/isAuth");

module.exports = (router) => {
  router.delete(
    "/deleteUserProfile",
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
    profileManagementController.deleteUserProfile
  );

  router.patch(
    "/updateUserProfile",
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
      check("dob").isISO8601().withMessage(con.accountManagement.INVALID_DOB),
      check("about", con.accountManagement.INVALID_ABOUT)
        .optional()
        .isString()
        .trim()
        .isLength({ min: 0, max: 100 }),
      check("imageUrl", con.accountManagement.INVALID_IMAGE)
        .optional()
        .isURL({ protocols: ["http", "https"], require_protocol: true }),
      check("skills", con.accountManagement.SKILLS).optional().isArray({ max: 20 }),
      check("skills.*", con.accountManagement.SKILL).isString(),
    ],
    isUserAuthenticated,
    profileManagementController.updateUserProfile
  );

  router.get("/getUserProfile", isUserAuthenticated, profileManagementController.getUserProfile);

  router.patch(
    "/updateUserPassword",
    isUserAuthenticated,
    [
      check("userId").custom((value) => {
        if (!common.isValidMongoId(value)) {
          const error = new Error(con.userManagement.INVALID_USER_ID);
          throw error;
        }
        return true;
      }),
      check("currentPassword", con.userManagement.PASSWORD_NOT_EXIST)
        .isString()
        .trim()
        .isLength({ min: 1 }),
      check("newPassword")
        .isLength({ min: 6, max: 30 })
        .withMessage(con.accountManagement.PASSWORD_LENGTH)
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).*$/)
        .withMessage(con.accountManagement.PASSWORD_PATTERN),
    ],
    profileManagementController.updateUserPassword
  );
};
