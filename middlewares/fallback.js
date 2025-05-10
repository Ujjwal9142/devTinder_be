const resp = require("../helpers/response");
const statusCodes = require("../helpers/statusCodes");

const fallbackRoute = (req, res, next) => {
  const errorMessage = "The route you are looking for does not exist";
  return resp.cResponse(req, res, statusCodes.NOT_FOUND, errorMessage);
};

module.exports = fallbackRoute;