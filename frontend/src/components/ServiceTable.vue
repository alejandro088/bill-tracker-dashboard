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
import { statusColor, statusIcon, formatAmountWithCurrency } from '../utils/formatters';

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

const getCategoryInfo = (category) => {
    switch (category) {
        case 'utilities':
            return 'Servicios básicos como luz, agua, gas, etc.';
        case 'subscriptions':
            return 'Suscripciones a servicios digitales';
        case 'taxes':
            return 'Impuestos y tasas gubernamentales';
        default:
            return 'Otros tipos de servicios';
    }
};

const getCategoryColor = (category) => {
    switch (category) {
        case 'utilities':
            return 'blue';
        case 'subscriptions':
            return 'purple';
        case 'taxes':
            return 'red';
        default:
            return 'grey';
    }
};

const getCategoryIcon = (category) => {
    switch (category) {
        case 'utilities':
            return 'mdi-flash';
        case 'subscriptions':
            return 'mdi-shopping';
        case 'taxes':
            return 'mdi-bank';
        default:
            return 'mdi-help-circle';
    }
};

const getProviderInfo = (provider) => {
    switch (provider) {
        case 'Visa':
            return 'Pago con tarjeta Visa';
        case 'Mastercard':
            return 'Pago con tarjeta Mastercard';
        case 'MercadoPago':
            return 'Pago a través de MercadoPago';
        case 'Google Play':
            return 'Pago a través de Google Play';
        case 'MODO':
            return 'Pago con MODO';
        case 'PayPal':
            return 'Pago con PayPal';
        default:
            return 'Otros medios de pago';
    }
};

const getProviderIcon = (provider) => {
    switch (provider) {
        case 'Visa':
            return 'mdi-credit-card';
        case 'Mastercard':
            return 'mdi-credit-card';
        case 'MercadoPago':
            return 'mdi-cart';
        case 'Google Play':
            return 'mdi-google-play';
        case 'MODO':
            return 'mdi-cellphone';
        case 'PayPal':
            return 'mdi-paypal';
        default:
            return 'mdi-cash';
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
</script>