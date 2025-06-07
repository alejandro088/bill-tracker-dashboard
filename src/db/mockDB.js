// In-memory array to simulate a database of bills
const bills = [
  {
    id: '1',
    name: 'Electricity',
    description: 'Monthly power bill',
    category: 'utilities',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 60.5,
    status: 'pending',
    autoRenew: false,
    paymentProvider: 'Visa'
  },
  {
    id: '2',
    name: 'Streaming Service',
    description: 'Video subscription',
    category: 'subscriptions',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 12.99,
    status: 'pending',
    autoRenew: true,
    paymentProvider: 'Mastercard'
  },
  {
    id: '3',
    name: 'Music Streaming',
    description: 'Audio subscription',
    category: 'subscriptions',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 9.99,
    status: 'pending',
    autoRenew: true,
    paymentProvider: 'MercadoPago'
  },
  {
    id: '4',
    name: 'Google Storage',
    description: 'Cloud storage subscription',
    category: 'subscriptions',
    dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 2.99,
    status: 'pending',
    autoRenew: true,
    paymentProvider: 'Google Play'
  },
  {
    id: '5',
    name: 'Ride Share',
    description: 'Local rides',
    category: 'services',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 15.5,
    status: 'pending',
    autoRenew: false,
    paymentProvider: 'MODO'
  },
  {
    id: '6',
    name: 'Online Shopping',
    description: 'Misc online purchases',
    category: 'others',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 40.0,
    status: 'pending',
    autoRenew: false,
    paymentProvider: 'PayPal'
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
