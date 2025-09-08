const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const asyncWrapper = require("../helpers/asyncWrapper");
const resp = require("../helpers/response");
const validationHelper = require("../helpers/validation");
const con = require("../constants/index");
const common = require("../helpers/common");
const moment = require("moment");

const USER_POPULATE_SAFE_DATA = "email firstName lastName imageUrl gender about skills dateOfBirth";

const requestManagementController = {
  sendConnectionRequest: asyncWrapper(async (req, res) => {
    validationHelper(req);
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;
    const allowedStatus = [
      con.requestManagement.STATUS_INTERESTED,
      con.requestManagement.STATUS_IGNORED,
    ];

    if (!allowedStatus.includes(status)) {
      return resp.cResponse(
        req,
        res,
        resp.EXPECTATION_FAILED,
        con.requestManagement.INVALID_SEND_STATUS
      );
    }

    if (fromUserId.toString() == toUserId.toString()) {
      return resp.cResponse(req, res, resp.BAD_REQUEST, con.requestManagement.SELF_REQUEST_INVALID);
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return resp.cResponse(req, res, resp.NOT_FOUND, con.requestManagement.NO_USER_FOR_ID);
    }

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (!existingConnectionRequest) {
      const newConnectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const newConnectionResponse = await newConnectionRequest.save();
      if (status === con.requestManagement.STATUS_INTERESTED) {
        return resp.cResponse(req, res, resp.CREATED, con.requestManagement.LIKED_SUCESSFULLY, {
          info: newConnectionResponse,
        });
      }
      return resp.cResponse(req, res, resp.CREATED, con.requestManagement.IGNORED_SUCESSFULLY, {
        info: newConnectionResponse,
      });
    } else {
      return resp.cResponse(req, res, resp.SUCCESS, con.requestManagement.REQUEST_ALREADY_EXISTS);
    }
  }),

  reviewConnectionRequest: asyncWrapper(async (req, res) => {
    validationHelper(req);
    const loggedinUserId = req.user._id;
    const requestId = req.params.requestId;
    const status = req.params.status;
    const allowedStatus = [
      con.requestManagement.STATUS_ACCEPTED,
      con.requestManagement.STATUS_REJECTED,
    ];

    if (!allowedStatus.includes(status)) {
      return resp.cResponse(
        req,
        res,
        resp.EXPECTATION_FAILED,
        con.requestManagement.INVALID_REVIEW_STATUS
      );
    }

    const existingConnectionRequest = await ConnectionRequest.findById(requestId).populate([
      { path: "fromUserId", select: USER_POPULATE_SAFE_DATA },
      { path: "toUserId", select: USER_POPULATE_SAFE_DATA },
    ]);

    if (!existingConnectionRequest) {
      return resp.cResponse(req, res, resp.NOT_FOUND, con.requestManagement.NO_REQUEST_FOR_ID);
    }

    if (!existingConnectionRequest.toUserId.equals(loggedinUserId)) {
      return resp.cResponse(req, res, resp.UNAUTHORIZED, con.accountManagement.UNAUTHORIZED_ACTION);
    }

    if (existingConnectionRequest.status !== con.requestManagement.STATUS_INTERESTED) {
      return resp.cResponse(
        req,
        res,
        resp.FORBIDDEN_ERROR,
        con.requestManagement.REVIEW_ONLY_INTERESTED
      );
    }

    const emailCreds = {
      reciverEmail: existingConnectionRequest.fromUserId.email,
      requestStatus: status,
      requestedPersonName: `${existingConnectionRequest.toUserId.firstName} ${existingConnectionRequest.toUserId.lastName}`,
      recieverName: `${existingConnectionRequest.fromUserId.firstName} ${existingConnectionRequest.fromUserId.lastName}`,
    };

    existingConnectionRequest.status = status;
    const response = await existingConnectionRequest.save();
    await common.sendEmail(emailCreds);

    if (status === con.requestManagement.STATUS_ACCEPTED) {
      return resp.cResponse(req, res, resp.SUCCESS, con.requestManagement.ACCEPTED_SUCESSFULLY, {
        requestData: response,
      });
    }
    return resp.cResponse(req, res, resp.SUCCESS, con.requestManagement.REJECTED_SUCESSFULLY, {
      requestData: response,
    });
  }),
};

module.exports = requestManagementController;
