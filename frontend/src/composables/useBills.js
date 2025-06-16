import { ref, computed } from 'vue';
import api from '../api';

export function useBills(serviceId) {
    const service = ref(null);
    const bills = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const sortedBills = computed(() =>
        [...bills.value].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    );

    const totals = computed(() => {
        return bills.value.reduce(
            (acc, b) => {
                acc[b.status] += b.amount;
                return acc;
            },
            { paid: 0, pending: 0, overdue: 0 }
        );
    });

    const fetchData = async () => {
        loading.value = true;
        try {
            const { data } = await api.get(`/services/${serviceId}`);
            service.value = data;
            bills.value = data.bills || [];
            error.value = null;
        } catch (err) {
            error.value = err.message;
        } finally {
            loading.value = false;
        }
    };

    const removeBill = async (billId) => {
        try {
            await api.delete(`/bills/${billId}`);
            await fetchData();
            return true;
        } catch (err) {
            error.value = err.message;
            return false;
        }
    };

    const cancelSubscription = async () => {
        try {
            await api.put(`/services/${serviceId}`, {
                autoRenew: false
            });
            await fetchData(); // Recargar los datos para reflejar el cambio
            return true;
        } catch (err) {
            error.value = err.message;
            return false;
        }
    };

    return {
        service,
        bills: sortedBills,
        loading,
        error,
        totals,
        fetchData,
        removeBill,
        cancelSubscription
    };
}
