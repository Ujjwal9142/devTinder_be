const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const asyncWrapper = require("../helpers/asyncWrapper");
const resp = require("../helpers/response");
const validationHelper = require("../helpers/validation");
const con = require("../constants/index");
const common = require("../helpers/common");
const moment = require("moment");

const accountSetupController = {
  signup: asyncWrapper(async (req, res) => {
    validationHelper(req);
    const {
      firstName,
      lastName,
      password,
      confirmPassword,
      email,
      gender,
      dob,
      about,
      imageUrl,
      skills,
    } = req.body;
    if (password !== confirmPassword) {
      return resp.cResponse(req, res, resp.BAD_REQUEST, con.accountManagement.PASSWORD_MISMATCH);
    }
    const isAgeValid = common.checkAge(dob);
    if (!isAgeValid) {
      return resp.cResponse(req, res, resp.BAD_REQUEST, con.accountManagement.MIN_AGE_SIGNUP);
    }
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return resp.cResponse(req, res, resp.CONFLICT, con.accountManagement.USER_EXISTS);
    }

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const userData = {
      firstName,
      lastName,
      email,
      gender,
      password: hashedPassword,
      dateOfBirth: dob,
    };
    if (about || about === "") userData.about = about;
    if (imageUrl) userData.imageUrl = imageUrl;
    if (skills && skills.length > 0) userData.skills = skills;

    const newUser = new User(userData);
    await newUser.save();
    return resp.cResponse(req, res, resp.CREATED, con.accountManagement.SIGNUP_SUCESSFULL);
  }),

  login: asyncWrapper(async (req, res) => {
    validationHelper(req);
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return resp.cResponse(req, res, resp.NOT_FOUND, con.accountManagement.NO_USER);
    }
    const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);
    if (!isPasswordCorrect) {
      return resp.cResponse(req, res, resp.UNAUTHORIZED, con.accountManagement.LOGIN_FAILED);
    }

    const userDetails = {
      id: existingUser._id,
      email: existingUser.email,
    };
    const jwt_secret = process.env.JWT_SECRET;
    const token = jwt.sign(userDetails, jwt_secret, {
      expiresIn: "1d",
    });
    return resp.cResponse(req, res, resp.SUCCESS, con.accountManagement.LOGIN_SUCCESSFULL, {
      token,
    });
  }),

  logout: asyncWrapper(async (req, res) => {
    const tempData = {
      id: "",
      email: "",
    };
    const jwt_secret = process.env.JWT_SECRET;
    const tokenTime = -120;
    const token = jwt.sign(tempData, jwt_secret, { expiresIn: tokenTime });
    return resp.cResponse(req, res, resp.SUCCESS, con.accountManagement.LOGOUT_SUCCESSFULL, {
      token,
    });
  }),
};

module.exports = accountSetupController;
