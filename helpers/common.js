const common = {
  checkAge: (dob) => {
    const my_dob = new Date(dob);
    const today = new Date();
    const max_dob = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
    return max_dob.getTime() > my_dob.getTime();
  },

  isValidMongoId: (id) => {
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    return objectIdPattern.test(id);
  },
};

module.exports = common;
