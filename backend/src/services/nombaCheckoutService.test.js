const test = require('node:test');
const assert = require('node:assert/strict');

const { buildCheckoutPayload } = require('./nombaCheckoutService');

test('buildCheckoutPayload includes both callback and webhook URLs', () => {
  const payload = buildCheckoutPayload({
    amount: 2500,
    customerName: 'Ada Lovelace',
    customerEmail: 'ada@example.com',
    merchantTxRef: 'shapay_test_001',
  });

  assert.equal(payload.order.callbackUrl, 'http://localhost:3000/payments/callback');
  assert.equal(payload.order.webhookUrl, 'http://localhost:5000/webhooks/nomba');
});
