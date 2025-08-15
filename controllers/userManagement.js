const User = require("../models/user");
const asyncWrapper = require("../helpers/asyncWrapper");
const resp = require("../helpers/response");
const validationHelper = require("../helpers/validation");
const con = require("../constants/index");
const common = require("../helpers/common");
const moment = require("moment");

const userManagementController = {
  getUserByEmail: asyncWrapper(async (req, res) => {
    validationHelper(req);
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user) {
      return resp.cResponse(req, res, resp.NOT_FOUND, con.userManagement.NO_USER_FOR_EMAIL);
    }
    const userDetails = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dob: moment(user.dateOfBirth).format("YYYY-MM-DD"),
      gender: user.gender,
    };
    return resp.cResponse(req, res, resp.SUCCESS, con.userManagement.USER_FOUND_SUCESSFULLY, {
      user: userDetails,
    });
  }),

  feed: asyncWrapper(async (req, res) => {
    validationHelper(req);
    const { pageNumber = 1, pageSize = 10 } = req.body;
    const skippedItems = (pageNumber - 1) * pageSize;
    const users = await User.find().skip(skippedItems).limit(pageSize);
    if (!users || users.length === 0) {
      return resp.cResponse(req, res, resp.SUCCESS, con.accountManagement.NO_RECORD, {
        users: [],
      });
    }
    const formattedUsers = users.map((user) => ({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dob: moment(user.dateOfBirth).format("YYYY-MM-DD"),
      gender: user.gender,
    }));
    return resp.cResponse(req, res, resp.SUCCESS, con.accountManagement.RECORD_SUCCESS, {
      users: formattedUsers,
    });
  }),

  deleteUser: asyncWrapper(async (req, res) => {
    validationHelper(req);
    const { userId } = req.query;
    const signedInUserId = req.user._id;

    if (signedInUserId != userId) {
      return resp.cResponse(req, res, resp.SUCCESS, con.accountManagement.UNAUTHORIZED_ACTION);
    }
    await User.findByIdAndDelete(userId);
    return resp.cResponse(req, res, resp.SUCCESS, con.userManagement.USER_DELETED);
  }),
};

module.exports = userManagementController;
