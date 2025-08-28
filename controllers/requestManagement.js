const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const asyncWrapper = require("../helpers/asyncWrapper");
const resp = require("../helpers/response");
const validationHelper = require("../helpers/validation");
const con = require("../constants/index");
const common = require("../helpers/common");
const moment = require("moment");

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

    if (fromUserId == toUserId) {
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
};

module.exports = requestManagementController;
