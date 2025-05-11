const user = require("../models/user");
const bcrypt = require("bcryptjs");
const asyncWrapper = require("../helpers/asyncWrapper");
const resp = require("../helpers/response");
const statusCodes = require("../helpers/statusCodes");
const validationHelper = require("../helpers/validation");

const accountSetupController = {
  signup: asyncWrapper(async (req, res) => {
    validationHelper(req);
  }),

  login: asyncWrapper(async (req, res) => {}),
};

module.exports = accountSetupController;
