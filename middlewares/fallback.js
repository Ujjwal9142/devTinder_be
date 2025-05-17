const resp = require("../helpers/response");

const fallbackRoute = (req, res, next) => {
  const errorMessage = "The route you are looking for does not exist";
  return resp.cResponse(req, res, resp.NOT_FOUND, errorMessage);
};

module.exports = fallbackRoute;