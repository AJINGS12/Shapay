const payments = new Map();

const savePayment = (payment) => {
  payments.set(payment.orderReference, payment);
};

const getPayment = (orderReference) => {
  return payments.get(orderReference);
};

const updatePaymentStatus = (orderReference, status) => {
  const payment = payments.get(orderReference);

  if (!payment) return null;

  payment.status = status;

  payments.set(orderReference, payment);

  return payment;
};

const getAllPayments = () => {
  return Array.from(payments.values());
};

module.exports = {
  savePayment,
  getPayment,
  updatePaymentStatus,
  getAllPayments,
};