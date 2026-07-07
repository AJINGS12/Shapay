const {
  generateRecoveryMessage,
} = require("./services/claudeService");

const test = async () => {
  const result =
    await generateRecoveryMessage({
      customerName: "Ismail",
      amount: 5000,
      reason:
        "Insufficient Funds",
      planName: "Pro Plan",
      merchantName: "Netflix NG",
    });

  console.log(
    "\nGenerated message:\n"
  );

  console.log(result);
};

test();