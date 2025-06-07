// In-memory array to simulate a database of bills
const bills = [
  {
    id: '1',
    name: 'Electricity',
    description: 'Monthly power bill',
    category: 'utilities',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 60.5,
    status: 'pending'
  },
  {
    id: '2',
    name: 'Streaming Service',
    description: 'Video subscription',
    category: 'subscriptions',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 12.99,
    status: 'pending'
  }
];

export const getBills = () => bills;

export const getBillById = (id) => bills.find((b) => b.id === id);

export const addBill = (bill) => {
  bills.push(bill);
  return bill;
};

export const updateBill = (id, data) => {
  const index = bills.findIndex((b) => b.id === id);
  if (index === -1) return null;
  bills[index] = { ...bills[index], ...data };
  return bills[index];
};

export const deleteBill = (id) => {
  const index = bills.findIndex((b) => b.id === id);
  if (index === -1) return false;
  bills.splice(index, 1);
  return true;
};
