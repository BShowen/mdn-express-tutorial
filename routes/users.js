var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/cool", (req, res, next) => {
  res.json({
    first: "Bradley",
    last: "Showen",
    pets: [
      { species: "cat", name: "Peepees" },
      { spieces: "cat", name: "Lil babies" },
    ],
  });
});

module.exports = router;
