const fs = require("fs");

const asyncWrapper = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    } finally {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          return true;
        }
      }
    }
  };
};

module.exports = asyncWrapper;