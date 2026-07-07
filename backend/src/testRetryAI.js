const {
  generateRetryRecommendation,
} = require("./services/retryIntelligenceService");

const test = async () => {
  const result =
    await generateRetryRecommendation({
      customerName: "Ismail",
      amount: 5000,
      reason:
        "Insufficient Funds",
      previousFailures: 1,
    });

  console.log(
    "\nAI Retry Recommendation:\n"
  );

  console.log(result);
};

test();