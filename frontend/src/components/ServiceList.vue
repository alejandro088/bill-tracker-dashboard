<template>
    <div>
        <ServiceHeader @refresh="refresh" @notify="notify" />
        
        <ServiceFilters
            v-model:search="search"
            v-model:category="category"
            v-model:currency="currency"
            v-model:paymentProvider="paymentProvider"
            v-model:recurrence="recurrence"
        />
        
        <ServiceDueSoonSwitch v-model="dueSoon" />
        
        <ServiceTable
            :services="filteredServices"
            :loading="loading"
            :error="error"
            @add-bill="newInvoice"
            @archive="archive"
        />

        <ManualInvoiceForm
            v-if="newBill"
            :bill="newBill"
            @created="onCreated"
            @close="closeNew"
        />
        <QuickBillDialog
            v-if="selectedBill"
            :bill="selectedBill"
            @updated="fetchServices"
            @close="closeQuick"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import api from '../api.js';
import ManualInvoiceForm from './ManualInvoiceForm.vue';
import QuickBillDialog from './QuickBillDialog.vue';
import ServiceHeader from './ServiceHeader.vue';
import ServiceFilters from './ServiceFilters.vue';
import ServiceDueSoonSwitch from './ServiceDueSoonSwitch.vue';
import ServiceTable from './ServiceTable.vue';

const emit = defineEmits(['notify']);

const notify = (message) => {
    emit('notify', message);
};

const onCreated = async (bill) => {
    await fetchServices();
    notify('Servicio creado exitosamente');
    closeNew();
};

const services = ref([]);
const loading = ref(false);
const error = ref(null);
const category = ref(localStorage.getItem('svc_category') || '');
const paymentProvider = ref(localStorage.getItem('svc_provider') || '');
const recurrence = ref(localStorage.getItem('svc_recurrence') || '');
const newBill = ref(null);
const selectedBill = ref(null);
const dueSoon = ref(localStorage.getItem('svc_dueSoon') === '1');
const search = ref('');
const currency = ref('');

// Watchers for localStorage
watch(category, (val) => localStorage.setItem('svc_category', val));
watch(paymentProvider, (val) => localStorage.setItem('svc_provider', val));
watch(recurrence, (val) => localStorage.setItem('svc_recurrence', val));
watch(dueSoon, (val) => localStorage.setItem('svc_dueSoon', val ? '1' : '0'));

const fetchServices = async () => {
    loading.value = true;
    error.value = null;
    try {
        const response = await api.get('/api/services');
        services.value = response.data;
    } catch (err) {
        error.value = 'Error al cargar los servicios: ' + err.message;
    } finally {
        loading.value = false;
    }
};

const filteredServices = computed(() => {
    return services.value
        .filter((service) => {
            if (search.value) {
                return service.name.toLowerCase().includes(search.value.toLowerCase());
            }
            return true;
        })
        .filter((service) => {
            if (category.value) {
                return service.category === category.value;
            }
            return true;
        })
        .filter((service) => {
            if (currency.value) {
                return service.defaultCurrency === currency.value;
            }
            return true;
        })
        .filter((service) => {
            if (paymentProvider.value) {
                return service.paymentProvider === paymentProvider.value;
            }
            return true;
        })
        .filter((service) => {
            if (recurrence.value) {
                return service.recurrence === recurrence.value;
            }
            return true;
        })
        .filter((service) => {
            if (dueSoon.value) {
                const lastBill = service.lastBill;
                if (!lastBill) return false;
                
                const dueDate = new Date(lastBill.dueDate);
                const today = new Date();
                const sevenDaysFromNow = new Date(today.setDate(today.getDate() + 7));
                
                return dueDate <= sevenDaysFromNow;
            }
            return true;
        });
});

const refresh = () => {
    fetchServices();
};

const newInvoice = (service) => {
    newBill.value = {
        serviceId: service.id,
        serviceName: service.name,
        defaultCurrency: service.defaultCurrency
    };
};

const closeNew = () => {
    newBill.value = null;
};

const closeQuick = () => {
    selectedBill.value = null;
};

const archive = async (service) => {
    try {
        await api.patch(`/api/services/${service.id}/archive`);
        notify('Servicio archivado exitosamente');
        fetchServices();
    } catch (err) {
        notify({
            type: 'error',
            text: 'Error al archivar el servicio: ' + err.message
        });
    }
};

onMounted(fetchServices);
</script>

<style>
.filter-label {
    font-size: 0.875rem;
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
}

.header-card {
    background: linear-gradient(to right, #1867c0, #5cbbf6);
}

.bill-chip {
    min-width: 100px;
}
</style>
