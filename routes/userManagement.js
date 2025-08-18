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
};
