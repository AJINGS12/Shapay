const Anthropic =
  require("@anthropic-ai/sdk");

require("dotenv").config();

const anthropic =
  new Anthropic({
    apiKey:
      process.env.ANTHROPIC_API_KEY,
  });

const generateRetryRecommendation =
  async ({
    customerName,
    amount,
    reason,
    previousFailures,
  }) => {
    const prompt = `
You are an AI payment recovery assistant for a fintech platform called Shapay.

A subscription payment failed.

Customer Name: ${customerName}
Amount: ₦${amount}
Failure Reason: ${reason}
Previous Failed Attempts: ${previousFailures}

Recommend:
1. Best retry delay in hours
2. Brief reasoning

Return ONLY valid JSON in this format:

{
  "retryDelayHours": 24,
  "reasoning": "Customers often top up accounts within 24 hours after insufficient funds."
}
`;

    const response =
      await anthropic.messages.create({
        model:
          "claude-haiku-4-5-20251001",

        max_tokens: 200,

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    const text =
  response.content[0].text;

const cleaned =
  text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

return JSON.parse(cleaned);
  };

module.exports = {
  generateRetryRecommendation,
};