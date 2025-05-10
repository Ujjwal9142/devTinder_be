class ApiError extends Error {
  constructor(message, status, info) {
    super(message);
    this.status = status;
    if (info) {
      this.info = info;
    }
  }
}

module.exports = ApiError;