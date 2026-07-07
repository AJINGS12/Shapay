const Anthropic =
  require("@anthropic-ai/sdk");

require("dotenv").config();

const anthropic =
  new Anthropic({
    apiKey:
      process.env.CLAUDE_API_KEY,
  });

const generateRecoveryMessage =
  async ({
    customerName,
    amount,
    reason,
    planName,
    merchantName,
  }) => {
    const prompt = `
You are writing a subscription recovery message on behalf of ${merchantName}.

Customer Name: ${customerName}
Amount: ₦${amount}
Failure Reason: ${reason}
Plan Name: ${planName}

Write a concise, professional, empathetic payment recovery message.

Do NOT include:
- subject line
- placeholders
- fake support emails
- fake company names

Keep it clean and human.
`;

    const response =
      await anthropic.messages.create({
        model:
          "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    return response.content[0].text;
  };

module.exports = {
  generateRecoveryMessage,
};