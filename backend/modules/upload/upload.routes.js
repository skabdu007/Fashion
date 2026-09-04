// modules/upload/upload.routes.js
const express = require("express");
const router = express.Router();
const upload = require("../../middleware/upload");

router.post("/", upload.single("image"), (req, res) => {

 res.json({
  success: true,
  file: req.file,
  imagePath: req.file.path   // IMPORTANT
 });

});

module.exports = router;