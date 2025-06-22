<template>
    <div>
        <v-progress-linear v-if="loading" indeterminate class="mb-2" />
        <v-alert v-else-if="error" type="error" dense>{{ error }}</v-alert>
        <v-data-table
            v-else
            :headers="headers"
            :items="services"
            class="elevation-1 service-table rounded-lg"
            :hover="true"
            :loading="loading"
            loading-text="Cargando servicios..."
            no-data-text="No hay servicios registrados"
            :items-per-page="8"
        >
            <!-- Template para la columna de nombre -->
            <template #item.name="{ item }">
                <div class="d-flex align-center">
                    <ServiceIcon :service="item" class="mr-3" />
                    <div class="d-flex flex-column">
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
                        <div v-if="item.url" class="url-container">
                            <v-btn
                                :href="item.url"
                                target="_blank"
                                variant="text"
                                size="x-small"
                                class="px-0 text-grey text-decoration-none"
                                density="comfortable"
                            >
                                <v-icon size="small" start>mdi-link</v-icon>
                                {{ formatUrl(item.url) }}
                            </v-btn>
                        </div>
                    </div>
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
                            {{ getCategoryName(item.category) }}
                        </v-chip>
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

                    <v-tooltip text="Editar servicio">
                        <template #activator="{ props }">
                            <v-btn
                                v-bind="props"
                                color="warning"
                                variant="flat"
                                icon
                                size="small"
                                class="mx-1"
                                data-test="edit-button"
                                @click="$emit('edit', item)"
                            >
                                <v-icon>mdi-pencil</v-icon>
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
                                @click="$emit('add-bill', item)"
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
                                @click="$emit('archive', item)"
                            >
                                <v-icon>mdi-archive</v-icon>
                            </v-btn>
                        </template>
                    </v-tooltip>
                </div>
            </template>
        </v-data-table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api.js';
import { statusColor, statusIcon, formatAmountWithCurrency } from '../utils/formatters';
import ServiceIcon from './ServiceIcon.vue';

const props = defineProps({
    services: {
        type: Array,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: null
    }
});

defineEmits(['add-bill', 'archive', 'edit']);

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

const getCategoryInfo = (categoryId) => {
    if (!categoryId) return 'Sin categoría definida';

    console.log(categoryId)
    console.log(categories.value)
    
    const category = categories.value.find(c => c.name === categoryId);
    if (category) {
        return category.description || category.name;
    }
    
    return 'Categoría no encontrada';
};

const getCategoryColor = (categoryId) => {
    if (!categoryId) return 'grey';
    
    const category = categories.value.find(c => c.id === categoryId);
    if (category && category.color) {
        return category.color;
    }
    
    // Colores por defecto
    if (categoryId === 'utilities') return 'blue';
    if (categoryId === 'subscriptions') return 'purple';
    if (categoryId === 'taxes') return 'red';
    
    return 'grey';
};

const getCategoryIcon = (categoryId) => {
    if (!categoryId) return 'mdi-help-circle';
    
    const category = categories.value.find(c => c.id === categoryId);
    if (category && category.icon) {
        return category.icon;
    }
    
    // Iconos por defecto
    if (categoryId === 'utilities') return 'mdi-flash';
    if (categoryId === 'subscriptions') return 'mdi-shopping';
    if (categoryId === 'taxes') return 'mdi-bank';
    
    return 'mdi-help-circle';
};

const getCategoryName = (categoryId) => {
    if (!categoryId) return 'N/A';
    
    const category = categories.value.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
};

// Datos para categorías
const categories = ref([]);
const loadingCategories = ref(false);

// Cargar categorías desde el backend
const fetchCategories = async () => {
    loadingCategories.value = true;
    try {
        const { data } = await api.get('/categories');
        categories.value = data;
    } catch (error) {
        console.error('Error al obtener categorías:', error);
    } finally {
        loadingCategories.value = false;
    }
};

const getRecurrenceInfo = (item) => {
    switch (item.recurrence) {
        case 'weekly':
            return 'Pago semanal';
        case 'monthly':
            return 'Pago mensual';
        case 'bimonthly':
            return 'Pago bimestral';
        case 'yearly':
            return 'Pago anual';
        case 'none':
            return 'Pago único';
        default:
            return 'Sin recurrencia definida';
    }
};

const getRecurrenceColor = (recurrence) => {
    switch (recurrence) {
        case 'weekly':
            return 'red';
        case 'monthly':
            return 'blue';
        case 'bimonthly':
            return 'green';
        case 'yearly':
            return 'purple';
        default:
            return 'grey';
    }
};

const getRecurrenceIcon = (recurrence) => {
    switch (recurrence) {
        case 'weekly':
            return 'mdi-calendar-week';
        case 'monthly':
            return 'mdi-calendar-month';
        case 'bimonthly':
            return 'mdi-calendar-month';
        case 'yearly':
            return 'mdi-calendar-sync';
        default:
            return 'mdi-calendar-remove';
    }
};

const formatUrl = (url) => {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (e) {
        return url;
    }
};

// Cargar datos al montar el componente
onMounted(() => {
    fetchCategories();
});
</script>

<style scoped>
.url-container {
    margin-top: 2px;
}

.url-container .v-btn {
    font-size: 0.75rem;
    opacity: 0.8;
    min-width: 0;
}

.url-container .v-btn:hover {
    opacity: 1;
}
</style>