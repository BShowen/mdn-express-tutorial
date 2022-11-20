const express = require("express");
const router = express.Router();

router.use("/", require("./book_routes"));
router.use("/", require("./author_routes"));
router.use("/", require("./genre_routes"));
router.use("/", require("./book_instance_routes"));

module.exports = router;
