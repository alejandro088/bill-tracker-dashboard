const payments = [];

export const addPayment = (payment) => {
  payments.push(payment);
  return payment;
};

export const getPaymentsByName = (name) =>
  payments.filter((p) => p.name === name);

export const getAllPayments = () => payments;
