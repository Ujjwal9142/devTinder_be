const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const asyncWrapper = require("../helpers/asyncWrapper");
const resp = require("../helpers/response");
const validationHelper = require("../helpers/validation");
const con = require("../constants/index");
const common = require("../helpers/common");
const moment = require("moment");

const USER_POPULATE_SAFE_DATA = "firstName lastName imageUrl gender about skills dateOfBirth";

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
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender,
      dob: moment(user.dateOfBirth).format("YYYY-MM-DD"),
      imageUrl: user.imageUrl,
      skills: user.skills,
      about: user.about,
    };
    return resp.cResponse(req, res, resp.SUCCESS, con.userManagement.USER_FOUND_SUCESSFULLY, {
      user: userDetails,
    });
  }),

  getUserFeed: asyncWrapper(async (req, res) => {
    validationHelper(req);
    const { pageNumber = 1, pageSize = 10 } = req.body;
    const skippedItems = (pageNumber - 1) * pageSize;
    const loggedinUserId = req.user._id;

    const allConnectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedinUserId }, { toUserId: loggedinUserId }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    allConnectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [{ _id: { $nin: Array.from(hideUsersFromFeed) } }, { _id: { $ne: loggedinUserId } }],
    })
      .skip(skippedItems)
      .limit(pageSize)
      .select(USER_POPULATE_SAFE_DATA);

    if (!users || users.length === 0) {
      return resp.cResponse(req, res, resp.SUCCESS, con.accountManagement.NO_RECORD, {
        users: [],
      });
    }
    return resp.cResponse(req, res, resp.SUCCESS, con.accountManagement.RECORD_SUCCESS, {
      users: users,
    });
  }),

  getPendingConnectionRequests: asyncWrapper(async (req, res) => {
    validationHelper(req);
    const loggedinUserId = req.user._id;
    const connections = await ConnectionRequest.find({
      toUserId: loggedinUserId,
      status: con.requestManagement.STATUS_INTERESTED,
    }).populate("fromUserId", USER_POPULATE_SAFE_DATA);

    return resp.cResponse(req, res, resp.SUCCESS, con.accountManagement.RECORD_SUCCESS, {
      connectionRequests: connections,
    });
  }),

  getUserConnections: asyncWrapper(async (req, res) => {
    validationHelper(req);
    const loggedinUserId = req.user._id;
    const connections = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedinUserId }, { toUserId: loggedinUserId }],
      status: con.requestManagement.STATUS_ACCEPTED,
    }).populate([
      { path: "fromUserId", select: USER_POPULATE_SAFE_DATA },
      { path: "toUserId", select: USER_POPULATE_SAFE_DATA },
    ]);

    const responseData = connections?.map((item) => {
      if (item.fromUserId._id.toString() === loggedinUserId.toString()) {
        return item.toUserId;
      }
      return item.fromUserId;
    });

    return resp.cResponse(req, res, resp.SUCCESS, con.accountManagement.RECORD_SUCCESS, {
      connections: responseData,
    });
  }),
};

module.exports = userManagementController;
