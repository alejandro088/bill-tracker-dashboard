export const STATUS_CONFIG = {
    paid: {
        color: 'green',
        icon: 'mdi-check-circle'
    },
    pending: {
        color: 'orange',
        icon: 'mdi-clock-outline'
    },
    overdue: {
        color: 'red',
        icon: 'mdi-alert-circle'
    }
};

export const STATUS_OPTIONS = [
    { title: 'All', value: '' },
    { title: 'Paid', value: 'paid' },
    { title: 'Pending', value: 'pending' },
    { title: 'Overdue', value: 'overdue' }
];

export function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

export function summarizePayments(payments) {
    const map = {};
    payments.forEach((p) => {
        if (!map[p.paymentProvider]) map[p.paymentProvider] = 0;
        map[p.paymentProvider] += Number(p.amount);
    });
    return Object.entries(map)
        .map(([prov, amt]) => `${prov} ($${amt.toFixed(2)})`)
        .join(' + ');
}

export const TABLE_HEADERS = [
    { title: 'Due Date', key: 'dueDate' },
    { title: 'Monto', key: 'amount' },
    { title: 'Medio de pago', key: 'paymentProvider', sortable: false },
    { title: 'Estado', key: 'status' },
    { title: 'Acciones', key: 'actions', sortable: false }
];
