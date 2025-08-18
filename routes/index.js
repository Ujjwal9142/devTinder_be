const express = require("express");
const router = express.Router();

// Route imports
const accountSetup = require("./accountSetup");
const userManagement = require("./userManagement");
const profileManagement = require("./profileManagement");

// Make grouping of routes and call every group from here
accountSetup(router);
profileManagement(router);
userManagement(router);

module.exports = router;
