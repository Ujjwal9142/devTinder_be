const express = require("express");
const router = express.Router();

// Route imports
const accountSetup = require("./accountSetup");
const userManagement = require("./userManagement");

// Make grouping of routes and call every group from here
accountSetup(router);
userManagement(router);

module.exports = router;
