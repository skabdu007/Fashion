const express = require("express");
const router = express.Router();

const controller = require("./subscription.controller");

/* CREATE */
router.post("/", controller.create);

/* GET USER SUBSCRIPTION */
router.get("/user/:user_id", controller.getUserSubscription);

module.exports = router;