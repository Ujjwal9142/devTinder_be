const { check } = require("express-validator");
const accountSetupController = require("../controllers/accountSetup");
const con = require("../constants/index");

module.exports = (router) => {
  router.post(
    "/signup",
    [
      check("firstName", con.accountManagement.FIRST_NAME)
        .isString()
        .trim()
        .isLength({ min: 3, max: 30 }),
      check("lastName", con.accountManagement.LAST_NAME)
        .isString()
        .trim()
        .isLength({ min: 3, max: 30 }),
      check("password")
        .isLength({ min: 6, max: 30 })
        .withMessage(con.accountManagement.PASSWORD_LENGTH)
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).*$/)
        .withMessage(con.accountManagement.PASSWORD_PATTERN),
      check("gender", con.accountManagement.GENDER_ERROR).isIn(["male", "female", "other"]),
      check("email", con.accountManagement.INVALID_EMAIL).isEmail(),
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
    accountSetupController.signup
  );

  router.post(
    "/login",
    [
      check("email", con.accountManagement.INVALID_EMAIL).isEmail(),
      check("password", con.accountManagement.LOGIN_FAILED).isLength({ min: 6, max: 30 }),
    ],
    accountSetupController.login
  );
};
