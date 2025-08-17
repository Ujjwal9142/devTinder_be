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
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender,
      dob: moment(user.dateOfBirth).format("YYYY-MM-DD"),
      imageUrl: user.imageUrl,
      skills: user.skills,
      about: user.about,
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

  updateUser: asyncWrapper(async (req, res) => {
    validationHelper(req);
    const { userId, firstName, lastName, gender, email, dob, about, imageUrl, skills } = req.body;
    const signedInUserId = req.user._id;
    if (userId != signedInUserId) {
      return resp.cResponse(req, res, resp.UNAUTHORIZED, con.accountManagement.UNAUTHORIZED_ACTION);
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser._id != userId) {
      return resp.cResponse(req, res, resp.CONFLICT, con.accountManagement.USER_EXISTS);
    }

    let userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return resp.cResponse(req, res, resp.NOT_FOUND, con.accountManagement.NO_USER);
    }
    userToUpdate.firstName = firstName;
    userToUpdate.lastName = lastName;
    userToUpdate.gender = gender;
    userToUpdate.email = email;
    userToUpdate.dateOfBirth = dob;
    if (about || about === "") userToUpdate.about = about;
    if (imageUrl) userToUpdate.imageUrl = imageUrl;
    if (skills && skills.length > 0) userToUpdate.skills = skills;

    const updatedUser = await userToUpdate.save();
    const updatedResponse = {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      gender: updatedUser.gender,
      dob: moment(updatedUser.dateOfBirth).format("YYYY-MM-DD"),
      imageUrl: updatedUser.imageUrl,
      skills: updatedUser.skills,
      about: updatedUser.about,
    };
    return resp.cResponse(req, res, resp.SUCCESS, con.userManagement.USER_UPDATED, {
      user: updatedResponse,
    });
  }),

  getUserProfile: asyncWrapper(async (req, res) => {
    validationHelper(req);
    const userInfo = {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      gender: req.user.gender,
      dob: moment(req.user.dateOfBirth).format("YYYY-MM-DD"),
      imageUrl: req.user.imageUrl,
      skills: req.user.skills,
      about: req.user.about,
    };
    return resp.cResponse(req, res, resp.SUCCESS, con.accountManagement.RECORD_SUCCESS, {
      user: userInfo,
    });
  }),
};

module.exports = userManagementController;
