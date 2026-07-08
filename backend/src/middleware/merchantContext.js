const requireMerchant = (req, res, next) => {
  const merchantId = req.headers["x-merchant-id"];

  if (!merchantId) {
    return res.status(401).json({
      success: false,
      message: "Missing merchant identity",
    });
  }

  req.merchantId = merchantId;
  next();
};

module.exports = { requireMerchant };