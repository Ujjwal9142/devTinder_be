const jwt = require("jsonwebtoken");
const asyncWrapper = require("../helpers/asyncWrapper");
const User = require("../models/user");
const resp = require("../helpers/response");
const con = require("../constants/index");

const isUserAuthenticated = asyncWrapper(async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return resp.cResponse(req, res, resp.UNAUTHORIZED, con.accountManagement.NO_AUTH_HEADER);
  }
  let userId;
  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return resp.cResponse(req, res, resp.UNAUTHORIZED, err?.message);
    }
    userId = payload?.id;
  });
  const user = await User.findById(userId).select("-password");
  if (!user) {
    return resp.cResponse(req, res, resp.UNAUTHORIZED, con.accountManagement.PERMISSION_DENIED);
  }
  req.user = user;
  next();
});

module.exports = isUserAuthenticated;
