const express = require("express");
const router = express.Router();

const controller = require("./product.controller");
const upload = require("../../middleware/upload");

/* CREATE PRODUCT */
router.post("/", upload.single("image"), controller.create);

/* GET ALL */
router.get("/", controller.getAll);

/* SEARCH & ANALYTICS */
router.get("/search", controller.search);
router.get("/top-selling", controller.topSelling);
router.get("/top-rated", controller.topRated);
router.get("/low-stock", controller.lowStock);
router.get("/analytics", controller.analytics);

/* GET ONE */
router.get("/:id", controller.getOne);

/* UPDATE */
router.put("/:id", upload.single("image"), controller.update);

/* DELETE */
router.delete("/:id", controller.delete);

module.exports = router;