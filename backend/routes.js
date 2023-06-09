// Initialize express router
let router = require("express").Router();

// Import controller
var checkInController = require("./checkInController");

router.route("/checkin").post(contactController.new);

// Export API routes
module.exports = router;
