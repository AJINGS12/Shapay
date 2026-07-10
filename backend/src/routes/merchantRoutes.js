const express = require("express");

const {
  getMerchantProfile,
  upsertMerchantProfile,
} = require("../database/merchantStore");

const {
  requireMerchant,
} = require("../middleware/merchantContext");

const router = express.Router();

router.use(requireMerchant);

router.get("/profile", async (req, res) => {
  try {
    const profile = await getMerchantProfile(req.merchantId);

    res.status(200).json({
      success: true,
      profile: profile || { business_name: "", business_email: "" },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const { businessName, businessEmail } = req.body;

    const profile = await upsertMerchantProfile(req.merchantId, {
      businessName,
      businessEmail,
    });

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to save profile" });
  }
});

module.exports = router;