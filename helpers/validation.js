const { validationResult } = require("express-validator");
const resp = require('../helpers/response')
const ApiError = require("../helpers/apiError");

const handleValidationErrors = (req) => {
  const errorsArr = validationResult(req);
  if (!errorsArr.isEmpty()) {
    const errors = errorsArr.array();
    throw new ApiError(errors[0].msg, resp.UNPROCESSABLE_ENTITY);
  }
};

module.exports = handleValidationErrors;