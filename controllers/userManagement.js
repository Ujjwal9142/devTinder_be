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
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dob: moment(user.dateOfBirth).format("YYYY-MM-DD"),
      gender: user.gender,
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
      userId: updatedUser._id,
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
};

module.exports = userManagementController;
