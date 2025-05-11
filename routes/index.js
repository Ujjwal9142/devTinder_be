const express = require("express");
const router = express.Router();

// Route imports
const accountSetup = require("./accountSetup");

// Make grouping of routes and call every group from here
accountSetup(router);

module.exports = router;
