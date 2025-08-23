const User = require("../models/user");
const asyncWrapper = require("../helpers/asyncWrapper");
const resp = require("../helpers/response");
const validationHelper = require("../helpers/validation");
const con = require("../constants/index");
const common = require("../helpers/common");
const moment = require("moment");
const bcrypt = require("bcryptjs");

const profileManagementController = {
  deleteUserProfile: asyncWrapper(async (req, res) => {
    validationHelper(req);
    const { userId } = req.query;
    const signedInUserId = req.user._id;

    if (signedInUserId != userId) {
      return resp.cResponse(req, res, resp.SUCCESS, con.accountManagement.UNAUTHORIZED_ACTION);
    }
    await User.findByIdAndDelete(userId);
    return resp.cResponse(req, res, resp.SUCCESS, con.userManagement.USER_DELETED);
  }),

  updateUserProfile: asyncWrapper(async (req, res) => {
    // Email update is not allowed for users
    validationHelper(req);
    const { userId, firstName, lastName, gender, dob, about, imageUrl, skills } = req.body;
    const signedInUserId = req.user._id;
    if (userId != signedInUserId) {
      return resp.cResponse(req, res, resp.UNAUTHORIZED, con.accountManagement.UNAUTHORIZED_ACTION);
    }

    let userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return resp.cResponse(req, res, resp.NOT_FOUND, con.accountManagement.NO_USER);
    }
    userToUpdate.firstName = firstName;
    userToUpdate.lastName = lastName;
    userToUpdate.gender = gender;
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

  updateUserPassword: asyncWrapper(async (req, res) => {
    validationHelper(req);
    const { userId, currentPassword, newPassword, confirmNewPassword } = req.body;
    const signedInUserId = req.user._id;
    if (userId != signedInUserId) {
      return resp.cResponse(req, res, resp.UNAUTHORIZED, con.accountManagement.UNAUTHORIZED_ACTION);
    }
    if (newPassword !== confirmNewPassword) {
      return resp.cResponse(req, res, resp.BAD_REQUEST, con.accountManagement.PASSWORD_MISMATCH);
    }
    const userDetails = await User.findById(userId);
    const isCurrentPasswordValid = bcrypt.compareSync(currentPassword, userDetails.password);
    if (!isCurrentPasswordValid) {
      return resp.cResponse(
        req,
        res,
        resp.BAD_REQUEST,
        con.userManagement.CURRENT_PASSWORD_INCORRECT
      );
    }
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);
    userDetails.password = hashedPassword;
    await userDetails.save();
    return resp.cResponse(req, res, resp.SUCCESS, con.userManagement.PASSWORD_CHANGED);
  }),
};

module.exports = profileManagementController;
