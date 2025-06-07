// Simple in-memory storage for bills
const bills = new Map();

export default {
  getBills: () => Array.from(bills.values()),
  getBill: (id) => bills.get(id),
  addBill: (bill) => {
    bills.set(bill.id, bill);
    return bill;
  },
  updateBill: (id, data) => {
    if (!bills.has(id)) return null;
    const updated = { ...bills.get(id), ...data };
    bills.set(id, updated);
    return updated;
  },
  deleteBill: (id) => bills.delete(id)
};
