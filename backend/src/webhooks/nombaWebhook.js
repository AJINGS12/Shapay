const express = require("express");

const router = express.Router();

router.post("/nomba", (req, res) => {
  console.log("Nomba webhook received:");
  console.log(req.body);

  res.status(200).json({
    success: true,
    message: "Webhook received",
  });
});

module.exports = router;