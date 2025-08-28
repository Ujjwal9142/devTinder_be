const { check } = require("express-validator");
const requestManagementController = require("../controllers/requestManagement");
const con = require("../constants/index");
const common = require("../helpers/common");
const isUserAuthenticated = require("../middlewares/isAuth");

module.exports = (router) => {
  router.post(
    "/request/send/:status/:toUserId",
    isUserAuthenticated,
    check("toUserId").custom((value) => {
      if (!common.isValidMongoId(value)) {
        const error = new Error(con.userManagement.INVALID_USER_ID);
        throw error;
      }
      return true;
    }),
    requestManagementController.sendConnectionRequest
  );
};
