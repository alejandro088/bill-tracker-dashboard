import {
  addPayment as addPaymentToDb,
  getPaymentsByName,
  getAllPayments,
  updatePayment,
  deletePayment as removePayment
} from '../db/paymentsDB.js';

export const addPayment = async (payment) => addPaymentToDb(payment);

export const listPayments = async (name) =>
  name ? getPaymentsByName(name) : getAllPayments();

export const getPaymentSummary = async (startDate, endDate) => {
  const payments = await getAllPayments();

  // Filter by date range if provided
  const filteredPayments = payments.filter(payment => {
    const paidAt = new Date(payment.paidAt);
    if (startDate && paidAt < startDate) return false;
    if (endDate && paidAt > endDate) return false;
    return true;
  });

  // Calculate total paid
  const totalPaid = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  // Calculate monthly average
  let monthlyAverage = 0;
  if (filteredPayments.length > 0) {
    // Get the date range
    const dates = filteredPayments.map(p => new Date(p.paidAt));
    const minDate = startDate || new Date(Math.min(...dates));
    const maxDate = endDate || new Date(Math.max(...dates));

    // Calculate months difference
    const monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
      (maxDate.getMonth() - minDate.getMonth()) + 1;

    monthlyAverage = totalPaid / (monthsDiff || 1); // Avoid division by zero
  }

  // Get most used payment provider
  const providerCounts = {};
  filteredPayments.forEach(payment => {
    const provider = payment.paymentProvider || 'Unknown';
    providerCounts[provider] = (providerCounts[provider] || 0) + 1;
  });

  let mostUsedProvider = 'None';
  let maxCount = 0;

  Object.entries(providerCounts).forEach(([provider, count]) => {
    if (count > maxCount) {
      mostUsedProvider = provider;
      maxCount = count;
    }
  });

  // Calculate previous period comparison
  let previousPeriodComparison = 0;
  if (startDate && endDate) {
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = new Date(endDate.getTime() - periodLength);

    const previousPeriodPayments = payments.filter(payment => {
      const paidAt = new Date(payment.paidAt);
      return paidAt >= previousStartDate && paidAt <= previousEndDate;
    });

    const previousTotal = previousPeriodPayments.reduce((sum, payment) => sum + payment.amount, 0);

    if (previousTotal > 0) {
      previousPeriodComparison = ((totalPaid - previousTotal) / previousTotal) * 100;
    }
  }

  return {
    totalPaid,
    monthlyAverage,
    mostUsedProvider,
    previousPeriodComparison,
    paymentCount: filteredPayments.length
  };
};

export const editPayment = async (id, payment) => {
  return await updatePayment(id, payment);
};

export const deletePayment = async (id) => {
  return await removePayment(id);
};

export const getPaymentTrends = async (startDate, endDate) => {
  const payments = await getAllPayments();

  // Filter by date range if provided
  const filteredPayments = payments.filter(payment => {
    const paidAt = new Date(payment.paidAt);
    if (startDate && paidAt < startDate) return false;
    if (endDate && paidAt > endDate) return false;
    return true;
  });

  // Group payments by month for timeline chart
  const byMonth = {};
  filteredPayments.forEach(payment => {
    const date = new Date(payment.paidAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    byMonth[monthKey] = (byMonth[monthKey] || 0) + payment.amount;
  });

  // Sort months chronologically
  const sortedMonths = Object.keys(byMonth).sort();

  // Group payments by category
  const byCategory = {};
  filteredPayments.forEach(payment => {
    const category = payment.Bill?.Service?.category || 'Unknown';
    byCategory[category] = (byCategory[category] || 0) + payment.amount;
  });

  // Group payments by payment provider
  const byProvider = {};
  filteredPayments.forEach(payment => {
    const provider = payment.paymentProvider || 'Unknown';
    byProvider[provider] = (byProvider[provider] || 0) + payment.amount;
  });

  return {
    timeline: {
      labels: sortedMonths,
      data: sortedMonths.map(month => byMonth[month])
    },
    categories: {
      labels: Object.keys(byCategory),
      data: Object.values(byCategory)
    },
    providers: {
      labels: Object.keys(byProvider),
      data: Object.values(byProvider)
    }
  };
};
