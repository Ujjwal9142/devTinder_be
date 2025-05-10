const statusCodes = require("../helpers/statusCodes");
const resp = require("../helpers/response");

const errorHandler = (error, req, res, next) => {
  const status = error.status || statusCodes.INTERNAL_SERVER;
  const message = error.message || "Something went wrong, please try again later";
  const info = error.info;
  if (info) {
    return resp.cResponse(req, res, status, message, info);
  } else {
    return resp.cResponse(req, res, status, message);
  }
};

module.exports = errorHandler;