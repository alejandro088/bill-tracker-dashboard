<template>
    <div>
        <v-card class="mb-4">
            <v-card-title class="header-card pa-4">
                <div>
                    <h2 class="text-h5 font-weight-medium mb-1 text-white">
                        Servicios registrados
                    </h2>
                    <div class="text-subtitle-2 text-white text-opacity-75">
                        Últimos servicios registrados al
                        {{
                            new Date().toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })
                        }}
                    </div>
                </div>
                <v-spacer></v-spacer>
                <BillForm @added="refresh" @notify="notify" />
            </v-card-title>
        </v-card>
        <v-row class="mb-4">
            <v-col cols="12" md="3">
                <div class="filter-label">
                    <v-icon size="18" class="mr-2">mdi-magnify</v-icon>
                    <span>Buscar</span>
                </div>
                <v-text-field
                    v-model="search"
                    placeholder="Buscar servicio"
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                    @input="onSearch"
                />
            </v-col>
            <v-col cols="12" md="2">
                <div class="filter-label">
                    <v-icon size="18" class="mr-2">mdi-shape</v-icon>
                    <span>Categoría</span>
                </div>
                <v-select
                    v-model="category"
                    :items="categoryOptions"
                    item-title="title"
                    item-value="value"
                    placeholder="Todas"
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                    @update:model-value="(value) => (category = value === null ? '' : value)"
                />
            </v-col>
            <v-col cols="12" md="2">
                <div class="filter-label">
                    <v-icon size="18" class="mr-2">mdi-currency-usd</v-icon>
                    <span>Moneda</span>
                </div>
                <v-select
                    v-model="currency"
                    :items="[
                        { title: 'Todas', value: '' },
                        { title: 'USD', value: 'USD' },
                        { title: 'ARS', value: 'ARS' }
                    ]"
                    placeholder="Todas"
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                />
            </v-col>
            <v-col cols="12" md="2">
                <div class="filter-label">
                    <v-icon size="18" class="mr-2">mdi-credit-card</v-icon>
                    <span>Proveedor</span>
                </div>
                <v-select
                    v-model="paymentProvider"
                    :items="providers"
                    item-title="title"
                    item-value="value"
                    placeholder="Todos"
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                    @update:model-value="(value) => (paymentProvider = value === null ? '' : value)"
                />
            </v-col>
            <v-col cols="12" md="2">
                <div class="filter-label">
                    <v-icon size="18" class="mr-2">mdi-calendar-refresh</v-icon>
                    <span>Recurrencia</span>
                </div>
                <v-select
                    v-model="recurrence"
                    :items="recurrenceOptions"
                    item-title="title"
                    item-value="value"
                    placeholder="Todas"
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                    @update:model-value="(value) => (recurrence = value === null ? '' : value)"
                />
            </v-col>
        </v-row>
        <v-row class="mb-4">
            <v-col cols="12" class="d-flex align-center">
                <v-switch
                    v-model="dueSoon"
                    density="compact"
                    label="Mostrar sólo servicios con vencimientos en los próximos 7 días"
                    color="warning"
                    hide-details
                />
            </v-col>
        </v-row>
        <v-progress-linear v-if="loading" indeterminate class="mb-2" />
        <v-alert v-else-if="error" type="error" dense>{{ error }}</v-alert>
        <v-data-table
            v-else
            :headers="headers"
            :items="filteredServices"
            class="elevation-2 service-table rounded-lg"
            :hover="true"
            :loading="loading"
            loading-text="Cargando servicios..."
            no-data-text="No hay servicios registrados"
            :items-per-page="8"
        >
            <!-- Template para la columna de nombre -->
            <template #item.name="{ item }">
                <div class="d-flex align-center">
                    <span class="font-weight-medium">{{ item.name }}</span>
                    <v-chip
                        size="x-small"
                        :color="item.defaultCurrency === 'USD' ? 'green' : 'primary'"
                        class="ml-2"
                        variant="flat"
                    >
                        {{ item.defaultCurrency }}
                    </v-chip>
                    <v-icon
                        v-if="item.autoRenew"
                        size="small"
                        color="warning"
                        class="ml-2"
                    >
                        mdi-autorenew
                    </v-icon>
                </div>
            </template>

            <!-- Template para la última factura -->
            <template #item.lastBill="{ item }">
                <v-chip
                    v-if="item.lastBill"
                    :color="statusColor(item.lastBill.status)"
                    size="small"
                    class="bill-chip"
                >
                    <v-icon start size="16">{{
                        statusIcon(item.lastBill.status)
                    }}</v-icon>
                    {{
                        formatAmountWithCurrency(
                            item.lastBill.amount,
                            item.lastBill.currency || item.defaultCurrency
                        )
                    }}
                </v-chip>
                <span v-else class="text-grey">Sin facturas</span>
            </template>

            <!-- Template para la categoría -->
            <template #item.category="{ item }">
                <v-tooltip :text="getCategoryInfo(item.category)">
                    <template #activator="{ props }">
                        <v-chip
                            v-bind="props"
                            :color="getCategoryColor(item.category)"
                            size="small"
                            class="text-capitalize"
                            variant="flat"
                        >
                            <v-icon size="16" start class="mr-1">{{ getCategoryIcon(item.category) }}</v-icon>
                            {{ item.category }}
                        </v-chip>
                    </template>
                </v-tooltip>
            </template>

            <template #item.paymentProvider="{ item }">
                <v-tooltip :text="getProviderInfo(item.paymentProvider)">
                    <template #activator="{ props }">
                        <div
                            v-bind="props"
                            class="d-flex align-center justify-center"
                        >
                            <v-icon
                                size="20"
                                :icon="getProviderIcon(item.paymentProvider)"
                                class="mr-1"
                            ></v-icon>
                            {{ item.paymentProvider }}
                        </div>
                    </template>
                </v-tooltip>
            </template>

            <template #item.recurrence="{ item }">
                <v-tooltip :text="getRecurrenceInfo(item)">
                    <template #activator="{ props }">
                        <div
                            v-bind="props"
                            class="d-flex align-center justify-center gap-2"
                        >
                            <v-icon
                                size="small"
                                :color="getRecurrenceColor(item.recurrence)"
                            >
                                {{ getRecurrenceIcon(item.recurrence) }}
                            </v-icon>
                            <span class="text-caption">{{
                                item.recurrence
                            }}</span>
                        </div>
                    </template>
                </v-tooltip>
            </template>

            <template #item.actions="{ item }">
                <div class="d-flex gap-1">
                    <v-tooltip text="Ver historial de facturas">
                        <template #activator="{ props }">
                            <v-btn
                                v-bind="props"
                                :to="`/services/${item.id}`"
                                color="info"
                                variant="flat"
                                icon
                                size="small"
                                class="mx-1"
                            >
                                <v-icon>mdi-file-document-outline</v-icon>
                            </v-btn>
                        </template>
                    </v-tooltip>

                    <v-tooltip text="Agregar factura">
                        <template #activator="{ props }">
                            <v-btn
                                v-bind="props"
                                color="success"
                                variant="flat"
                                icon
                                size="small"
                                class="mx-1"
                                @click="newInvoice(item)"
                            >
                                <v-icon>mdi-file-plus</v-icon>
                            </v-btn>
                        </template>
                    </v-tooltip>

                    <v-tooltip text="Archivar servicio">
                        <template #activator="{ props }">
                            <v-btn
                                v-bind="props"
                                color="grey-darken-2"
                                variant="flat"
                                icon
                                size="small"
                                class="mx-1"
                                @click="archive(item)"
                            >
                                <v-icon>mdi-archive</v-icon>
                            </v-btn>
                        </template>
                    </v-tooltip>
                </div>
            </template>
        </v-data-table>
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
import BillForm from './BillForm.vue';
import { statusColor, statusIcon, formatAmountWithCurrency } from '../utils/formatters';

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

const providers = [
    { title: 'Todos', value: '' },
    { title: 'Visa', value: 'Visa' },
    { title: 'Mastercard', value: 'Mastercard' },
    { title: 'MercadoPago', value: 'MercadoPago' },
    { title: 'Google Play', value: 'Google Play' },
    { title: 'MODO', value: 'MODO' },
    { title: 'PayPal', value: 'PayPal' },
];
const categoryOptions = [
    { title: 'Todas', value: '' },
    { title: 'Servicios', value: 'utilities' },
    { title: 'Suscripciones', value: 'subscriptions' },
    { title: 'Impuestos', value: 'taxes' },
    { title: 'Otros', value: 'others' },
];
const recurrenceOptions = [
    { title: 'Todas', value: '' },
    { title: 'Semanal', value: 'weekly' },
    { title: 'Mensual', value: 'monthly' },
    { title: 'Bimestral', value: 'bimonthly' },
    { title: 'Anual', value: 'yearly' },
    { title: 'Única vez', value: 'none' },
];

const headers = [
    {
        title: 'Servicio',
        key: 'name',
        align: 'start',
        sortable: true,
    },
    {
        title: 'Categoría',
        key: 'category',
        align: 'center',
        sortable: true,
    },
    {
        title: 'Proveedor',
        key: 'paymentProvider',
        align: 'center',
        sortable: true,
    },
    {
        title: 'Recurrencia',
        key: 'recurrence',
        align: 'center',
        sortable: true,
    },
    {
        title: 'Última factura',
        key: 'lastBill',
        align: 'center',
        sortable: true,
    },
    {
        title: 'Acciones',
        key: 'actions',
        align: 'end',
        sortable: false,
    },
];

const fetchServices = async (showNotification = false) => {
    loading.value = true;
    try {
        const { data } = await api.get('/services', {
            params: {
                category: category.value,
                paymentProvider: paymentProvider.value,
                recurrence: recurrence.value,
                dueSoon: dueSoon.value ? 7 : undefined,
            },
        });
        services.value = data;
        error.value = null;
        if (showNotification) {
            notify('Lista de servicios actualizada');
        }
    } catch (err) {
        error.value = err.message;
    } finally {
        loading.value = false;
    }
};

onMounted(fetchServices);
watch([category, paymentProvider, recurrence, dueSoon], () => {
    localStorage.setItem('svc_category', category.value);
    localStorage.setItem('svc_provider', paymentProvider.value);
    localStorage.setItem('svc_recurrence', recurrence.value);
    localStorage.setItem('svc_dueSoon', dueSoon.value ? '1' : '0');
    fetchServices();
});

watch(category, (newValue) => {
    if (newValue === null) {
        category.value = '';
    }
    localStorage.setItem('svc_category', category.value);
});

watch(paymentProvider, (newValue) => {
    if (newValue === null) {
        paymentProvider.value = '';
    }
    localStorage.setItem('svc_provider', paymentProvider.value);
});

watch(recurrence, (newValue) => {
    if (newValue === null) {
        recurrence.value = '';
    }
    localStorage.setItem('svc_recurrence', recurrence.value);
});

watch(dueSoon, (newValue) => {
    localStorage.setItem('svc_dueSoon', newValue ? '1' : '0');
});

watch(search, (newValue) => {
    localStorage.setItem('svc_search', newValue || '');
});

const filteredServices = computed(() => {
    if (!search.value) return services.value;
    return services.value.filter(
        (s) =>
            s.name.toLowerCase().includes(search.value.toLowerCase()) ||
            (s.category &&
                s.category
                    .toLowerCase()
                    .includes(search.value.toLowerCase())) ||
            (s.paymentProvider &&
                s.paymentProvider
                    .toLowerCase()
                    .includes(search.value.toLowerCase()))
    );
});

const refreshKey = ref(0);

const refresh = async () => {
    await fetchServices(true);
};

function onSearch() {
    // El filtrado es reactivo por computed
}

const newInvoice = (service) => {
    newBill.value = {
        serviceId: service.id,
        name: service.name,
        amount: service.lastBill?.amount || 0,
    };
};

function closeNew() {
    newBill.value = null;
}

function openQuick(bill) {
    selectedBill.value = bill;
}

function closeQuick() {
    selectedBill.value = null;
}

const archive = async (service) => {
    try {
        await api.put(`/services/${service.id}`, { archived: true });
        await fetchServices();
        notify(`El servicio ${service.name} ha sido archivado`);
    } catch (err) {
        console.log(err);
    }
};

function overdueDays(date) {
    const diff = Math.floor((new Date() - new Date(date)) / 86400000);
    return diff > 0 ? diff : 0;
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('es-ES');
}

function statusLabel(bill) {
    return { paid: 'Pagado', pending: 'Pendiente', overdue: 'Vencido' }[
        bill.status
    ];
}

function shortMonth(date) {
    return new Date(date)
        .toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
        .replace('.', '');
}

function dueTooltip(date) {
    const d = new Date(date);
    const prefix = d < new Date() ? 'Venció el' : 'Vencerá el';
    return `${prefix} ${formatDate(d)}`;
}

const getCategoryIcon = (category) => {
    const icons = {
        'subscriptions': 'mdi-refresh',
        'utilities': 'mdi-lightning-bolt',
        'taxes': 'mdi-file-document',
        'others': 'mdi-folder'
    };
    return icons[category] || 'mdi-help-circle';
};

const getCategoryInfo = (category) => {
    const descriptions = {
        'subscriptions': 'Servicios con renovación automática o periódica',
        'utilities': 'Servicios básicos como luz, gas, agua, etc.',
        'taxes': 'Impuestos y tasas gubernamentales',
        'others': 'Otros tipos de servicios'
    };
    return descriptions[category] || 'Categoría no especificada';
};

const getCategoryColor = (category) => {
    const colors = {
        'subscriptions': 'indigo',
        'utilities': 'orange',
        'taxes': 'red',
        'others': 'grey'
    };
    return colors[category] || 'grey';
};

const getProviderIcon = (provider) => {
    const icons = {
        Visa: 'mdi-credit-card',
        Mastercard: 'mdi-credit-card-outline',
        MercadoPago: 'mdi-cash',
        'Google Play': 'mdi-google-play',
        MODO: 'mdi-cellphone',
        PayPal: 'mdi-paypal',
    };
    return icons[provider] || 'mdi-credit-card-outline';
};

const getProviderInfo = (provider) => {
    const info = {
        Visa: 'Pago con tarjeta Visa',
        Mastercard: 'Pago con tarjeta Mastercard',
        MercadoPago: 'Pago a través de MercadoPago',
        'Google Play': 'Facturación a través de Google Play',
        MODO: 'Pago mediante MODO',
        PayPal: 'Pago mediante PayPal',
    };
    return info[provider] || 'Método de pago no especificado';
};

const getRecurrenceIcon = (recurrence) => {
    const icons = {
        weekly: 'mdi-calendar-week',
        monthly: 'mdi-calendar-month',
        bimonthly: 'mdi-calendar-blank',
        yearly: 'mdi-calendar',
        none: 'mdi-calendar-remove',
    };
    return icons[recurrence] || 'mdi-calendar';
};

const getRecurrenceColor = (recurrence) => {
    const colors = {
        weekly: 'purple',
        monthly: 'blue',
        bimonthly: 'teal',
        yearly: 'deep-purple',
        none: 'grey',
    };
    return colors[recurrence] || 'grey';
};

const getRecurrenceInfo = (item) => {
    const nextDate = calculateNextDueDate(item);
    return `Facturación ${item.recurrence}${
        nextDate ? `\nPróximo vencimiento: ${nextDate}` : ''
    }`;
};

const calculateNextDueDate = (item) => {
    if (!item.lastBill?.dueDate) return null;
    const date = new Date(item.lastBill.dueDate);
    const formatter = new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    switch (item.recurrence) {
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'bimonthly':
            date.setMonth(date.getMonth() + 2);
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
        default:
            return null;
    }

    return formatter.format(date);
};

const getBillTooltip = (bill) => {
    const status = { paid: 'Pagado', pending: 'Pendiente', overdue: 'Vencido' }[
        bill.status
    ];
    const date = new Date(bill.dueDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const amount = formatAmount(bill.amount);
    return `${status}\nMonto: ${amount}\nVencimiento: ${date}`;
};
</script>

<style scoped>
.bill-chip {
    min-width: 120px;
    justify-content: center;
}

.service-table {
    border-radius: 8px;
    overflow: hidden;
}

.service-table :deep(.v-data-table__thead tr th) {
    background-color: #f5f7fa !important;
    color: #2c3e50 !important;
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.service-table :deep(.v-data-table__tbody tr:nth-child(even)) {
    background-color: #f8fafc;
}

.service-table :deep(.v-data-table__tbody tr:hover) {
    background-color: #f0f4ff !important;
    transition: background-color 0.2s ease;
}

.service-table :deep(.v-data-table__tbody td) {
    padding: 12px 16px;
    font-size: 0.875rem;
}

.status-chip {
    font-weight: 500;
    letter-spacing: 0.5px;
    min-width: 100px;
    justify-content: center;
}

.header-card {
    background: linear-gradient(135deg, #ff9f43 0%, #ff7b1e 100%) !important;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.header-card :deep(.v-btn) {
    background-color: rgba(255, 255, 255, 0.1) !important;
    color: white !important;
}

.header-card :deep(.v-btn:hover) {
    background-color: rgba(255, 255, 255, 0.2) !important;
}

.v-chip {
    font-size: 0.8125rem !important;
}

.v-chip .v-icon {
    margin-right: 4px;
}

.trend-icon {
    font-size: 14px;
    margin-left: 4px;
}

.filter-label {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    color: rgba(0, 0, 0, 0.6);
    font-size: 0.875rem;
}

.filter-label .v-icon {
    opacity: 0.7;
}

:deep(.v-field) {
    border-radius: 8px;
    background-color: #f8fafc;
}

:deep(.v-field:hover) {
    background-color: #f0f4ff;
}

:deep(.v-field.v-field--focused) {
    background-color: white !important;
}

@media (max-width: 600px) {
    .service-table {
        font-size: 0.875rem;
    }

    .service-table :deep(.v-data-table__tbody td) {
        padding: 8px 12px;
    }

    .status-chip {
        min-width: 80px;
        font-size: 0.75rem !important;
    }
}
</style>
