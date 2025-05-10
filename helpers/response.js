const statusCodes = require("./statusCodes");

module.exports = class ResponseHelper {
  static async cResponse(req, res, status, info, data = null) {
    let customMsg;
    if (info.stack) {
      if (info.errorMessage) {
        customMsg = info.errorMessage;
        info = info.name;
      } else {
        customMsg = info.stack;
        info = info.message;
      }
    }

    let responseObj = {
      status: status,
      message: info,
    };
    if (data != null) {
      Object.assign(responseObj, { data: data });
    }

    if (info === "Database error" && customMsg) {
      if (customMsg.code === 11000) {
        // Duplicate key error (common in MongoDB)
        const duplicatedField = Object.keys(customMsg.keyValue || {})[0];
        responseObj.message = `${duplicatedField} already exists`;
      } else {
        responseObj.message = customMsg.message || info;
      }
    }

    res.status(status).json(responseObj);
  }
};
