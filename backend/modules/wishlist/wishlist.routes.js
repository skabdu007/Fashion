const express = require("express");

const router = express.Router();

const controller = require("./wishlist.controller");

/* ADD */
router.post("/", controller.add);

/* GET USER WISHLIST */
router.get("/:user_id", controller.getUserWishlist);

/* REMOVE */
router.delete("/:id", controller.remove);

module.exports = router;