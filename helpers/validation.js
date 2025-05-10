const { validationResult } = require("express-validator");
const statusCodes = require("../helpers/statusCodes");
const ApiError = require("../helpers/apiError");

const handleValidationErrors = (req) => {
  const errorsArr = validationResult(req);
  if (!errorsArr.isEmpty()) {
    const errors = errorsArr.array();
    throw new ApiError(errors[0].msg, statusCodes.UNPROCESSABLE_ENTITY);
  }
};

module.exports = handleValidationErrors;