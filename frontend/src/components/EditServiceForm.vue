<template>
    <v-dialog v-model="show" max-width="600px">
        <v-card>
            <v-card-title class="text-h5 pa-4">
                Editar servicio
            </v-card-title>

            <v-card-text class="pt-4">
                <v-form @submit.prevent="save" ref="form">
                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            v-model="formData.name"
                            label="Nombre del servicio"
                            :rules="[v => !!v || 'El nombre es requerido']"
                            required
                            variant="outlined"
                            density="comfortable"
                        />
                    </v-col>

                    <!-- Sección de identidad del servicio -->
                    <v-col cols="12">
                        <div class="text-subtitle-2 mb-2">Identidad del servicio</div>
                        <v-row>
                            <v-col cols="12" md="4">
                                <v-select
                                    v-model="formData.iconKey"
                                    :items="[
                                        { title: 'Ninguno', value: '' },
                                        { title: 'Netflix', value: 'netflix' },
                                        { title: 'YouTube', value: 'youtube' },
                                        { title: 'ChatGPT', value: 'chatgpt' },
                                        { title: 'Spotify', value: 'spotify' },
                                        { title: 'Amazon', value: 'amazon' },
                                        { title: 'Amazon Prime Video', value: 'amazonprime' },
                                        { title: 'Disney Plus', value: 'disney' },
                                        { title: 'GitHub', value: 'github' },
                                        { title: 'Google', value: 'google' },
                                        { title: 'Microsoft', value: 'microsoft' },
                                        { title: 'Apple', value: 'apple' },
                                        { title: 'Dropbox', value: 'dropbox' },
                                        { title: 'Slack', value: 'slack' }
                                    ]"
                                    label="Servicio popular"
                                    hint="Seleccione si es un servicio conocido"
                                    persistent-hint
                                    variant="outlined"
                                    density="comfortable"
                                >
                                    <template #selection="{ item }">
                                        <ServiceIcon :service="{ name: item.title, iconKey: item.value }" class="mr-2" />
                                        {{ item.title }}
                                    </template>
                                    <template #item="{ item, props }">
                                        <v-list-item v-bind="props">
                                            <template #prepend>
                                                <ServiceIcon :service="{ name: item.title, iconKey: item.value }" />
                                            </template>
                                        </v-list-item>
                                    </template>
                                </v-select>
                            </v-col>

                            <v-col cols="12" md="8">
                                <div v-if="!formData.iconKey">
                                    <div class="d-flex align-center mb-3">
                                        <v-text-field
                                            v-model="formData.customIconUrl"
                                            label="URL del ícono personalizado"
                                            hint="URL de la imagen que se usará como ícono (png, jpg, svg)"
                                            persistent-hint
                                            variant="outlined"
                                            density="comfortable"
                                            class="mr-2"
                                        />
                                        <v-btn
                                            color="primary"
                                            variant="text"
                                            @click="showIconPicker = true"
                                        >
                                            <v-icon>mdi-magnify</v-icon>
                                            Buscar ícono
                                        </v-btn>
                                    </div>

                                    <v-text-field
                                        v-model="formData.url"
                                        label="URL del servicio"
                                        hint="Opcional: se usará para obtener el favicon si no se provee un ícono personalizado"
                                        persistent-hint
                                        variant="outlined"
                                        density="comfortable"
                                    />

                                    <v-dialog v-model="showIconPicker" max-width="600px">
                                        <v-card>
                                            <v-card-title class="text-h6">
                                                Buscar ícono
                                                <v-spacer></v-spacer>
                                                <v-btn icon variant="text" @click="showIconPicker = false">
                                                    <v-icon>mdi-close</v-icon>
                                                </v-btn>
                                            </v-card-title>
                                            
                                            <v-card-text>
                                                <v-text-field
                                                    v-model="iconSearch"
                                                    label="Buscar ícono"
                                                    variant="outlined"
                                                    density="comfortable"
                                                    prepend-inner-icon="mdi-magnify"
                                                    clearable
                                                    class="mb-4"
                                                />

                                                <v-container class="icon-grid">
                                                    <v-row>
                                                        <v-col
                                                            v-for="icon in filteredIcons"
                                                            :key="icon"
                                                            cols="2"
                                                            class="d-flex justify-center"
                                                        >
                                                            <v-btn
                                                                variant="text"
                                                                icon
                                                                color="primary"
                                                                :class="{'selected-icon': formData.customIconKey === icon}"
                                                                @click="selectIcon(icon)"
                                                            >
                                                                <v-icon>{{ icon }}</v-icon>
                                                            </v-btn>
                                                        </v-col>
                                                    </v-row>
                                                </v-container>
                                            </v-card-text>
                                        </v-card>
                                    </v-dialog>
                                </div>
                                <v-text-field
                                    v-else
                                    v-model="formData.url"
                                    label="URL del servicio"
                                    hint="URL opcional para acceder al servicio"
                                    persistent-hint
                                    variant="outlined"
                                    density="comfortable"
                                />
                            </v-col>
                        </v-row>
                    </v-col>

                    <!-- Sección de información de facturación -->
                    <v-col cols="12" class="mt-4">
                        <div class="text-subtitle-2 mb-2">Información de facturación</div>
                        <v-row>
                            <v-col cols="12" md="4">
                                <v-select
                                    v-model="formData.category"
                                    :items="[
                                        { title: 'Servicios', value: 'utilities' },
                                        { title: 'Suscripciones', value: 'subscriptions' },
                                        { title: 'Impuestos', value: 'taxes' },
                                        { title: 'Otros', value: 'others' }
                                    ]"
                                    item-title="title"
                                    item-value="value"
                                    label="Categoría"
                                    required
                                    :rules="[v => !!v || 'La categoría es requerida']"
                                    variant="outlined"
                                    density="comfortable"
                                />
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-select
                                    v-model="formData.defaultCurrency"
                                    :items="['ARS', 'USD']"
                                    label="Moneda"
                                    required
                                    :rules="[v => !!v || 'La moneda es requerida']"
                                    variant="outlined"
                                    density="comfortable"
                                />
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-select
                                    v-model="formData.paymentProvider"
                                    :items="[
                                        'Visa',
                                        'Mastercard',
                                        'American Express',
                                        'MercadoPago',
                                        'PayPal',
                                        'Débito automático',
                                        'Transferencia bancaria',
                                        'Efectivo',
                                        'Google Play',
                                        'Otro'
                                    ]"
                                    label="Proveedor de pago"
                                    variant="outlined"
                                    density="comfortable"
                                />
                            </v-col>
                        </v-row>
                    </v-col>

                    <!-- Sección de configuración de facturación -->
                    <v-col cols="12">
                        <div class="text-subtitle-2 mb-2">Configuración de facturación</div>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-select
                                    v-model="formData.recurrence"
                                    :items="[
                                        { title: 'Ninguna', value: 'none' },
                                        { title: 'Mensual', value: 'monthly' },
                                        { title: 'Anual', value: 'yearly' },
                                    ]"
                                    item-title="title"
                                    item-value="value"
                                    label="Recurrencia"
                                    variant="outlined"
                                    density="comfortable"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-switch
                                    v-model="formData.autoRenew"
                                    :label="formData.autoRenew ? 'Renovación automática activada' : 'Renovación automática desactivada'"
                                    color="primary"
                                    inset
                                    class="mt-3"
                                />
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                </v-form>
            </v-card-text>

            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn
                    color="grey"
                    variant="text"
                    @click="show = false"
                >
                    Cancelar
                </v-btn>
                <v-btn
                    color="primary"
                    @click="save"
                >
                    Guardar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import api from '../api.js';
import ServiceIcon from './ServiceIcon.vue';

const props = defineProps({
    service: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['updated', 'close']);
const form = ref(null);
const loading = ref(false);
const show = ref(true);

// Observar cambios en show para emitir el evento close
watch(show, (value) => {
    if (!value) {
        emit('close');
    }
});

const showIconPicker = ref(false);
const iconSearch = ref('');

// Lista de íconos comunes de Material Design
const commonIcons = [
    'mdi-home', 'mdi-account', 'mdi-cog', 'mdi-pencil', 'mdi-delete',
    'mdi-plus', 'mdi-minus', 'mdi-check', 'mdi-close', 'mdi-menu',
    'mdi-star', 'mdi-heart', 'mdi-bell', 'mdi-email', 'mdi-phone',
    'mdi-calendar', 'mdi-clock', 'mdi-map', 'mdi-camera', 'mdi-music',
    'mdi-video', 'mdi-file', 'mdi-folder', 'mdi-image', 'mdi-link',
    'mdi-cloud', 'mdi-download', 'mdi-upload', 'mdi-refresh', 'mdi-sync',
    'mdi-alert', 'mdi-information', 'mdi-help', 'mdi-settings', 'mdi-search',
    'mdi-share', 'mdi-bookmark', 'mdi-tag', 'mdi-cart', 'mdi-store',
    'mdi-bank', 'mdi-cash', 'mdi-credit-card', 'mdi-wallet', 'mdi-currency-usd',
    'mdi-gift', 'mdi-package', 'mdi-truck', 'mdi-basket', 'mdi-shopping',
    'mdi-monitor', 'mdi-laptop', 'mdi-tablet', 'mdi-cellphone', 'mdi-printer',
    'mdi-wifi', 'mdi-bluetooth', 'mdi-network', 'mdi-database', 'mdi-server',
    'mdi-microsoft', 'mdi-apple', 'mdi-google', 'mdi-facebook', 'mdi-twitter'
];

const filteredIcons = computed(() => {
    if (!iconSearch.value) return commonIcons;
    return commonIcons.filter(icon => 
        icon.toLowerCase().replace('mdi-', '').includes(iconSearch.value.toLowerCase())
    );
});

const selectIcon = (icon) => {
    formData.value.customIconKey = icon;
    formData.value.customIconUrl = null; // Limpiar la URL personalizada
    showIconPicker.value = false;
};

const formData = ref({
    name: props.service.name,
    url: props.service.url,
    iconKey: props.service.iconKey,
    customIconUrl: props.service.customIconUrl,
    customIconKey: props.service.customIconKey,
    defaultCurrency: props.service.defaultCurrency,
    category: props.service.category,
    paymentProvider: props.service.paymentProvider,
    recurrence: props.service.recurrence,
    autoRenew: props.service.autoRenew
});

const closeDialog = () => {
    show.value = false;
};

const save = async () => {
    const { valid } = await form.value.validate();
    
    if (!valid) return;
    
    loading.value = true;
    try {
        await api.put(`/services/${props.service.id}`, formData.value);
        emit('updated');
        closeDialog();
    } catch (error) {
        console.error('Error al actualizar el servicio:', error);
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.icon-grid {
    max-height: 400px;
    overflow-y: auto;
}

.selected-icon {
    background-color: rgba(var(--v-theme-primary), 0.1) !important;
}

.v-btn.selected-icon .v-icon {
    color: rgb(var(--v-theme-primary));
}
</style>
