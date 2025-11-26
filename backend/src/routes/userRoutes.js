const express = require("express");
const router = express.Router();

// Test route to verify router works
router.get("/test", (req, res) => {
  res.send("User route working");
});

module.exports = router;