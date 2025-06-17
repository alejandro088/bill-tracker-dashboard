<template>
    <v-dialog v-model="show" max-width="600px">
        <v-card>
            <v-card-title class="text-h5 pa-4">
                Editar servicio
            </v-card-title>

            <v-card-text class="pt-4">
                <v-form @submit.prevent="save" ref="form">            <v-row>
                <v-col cols="12" md="8">
                    <v-text-field
                        v-model="formData.name"
                        label="Nombre del servicio"
                        :rules="[v => !!v || 'El nombre es requerido']"
                        required
                        variant="outlined"
                        density="comfortable"
                    />
                </v-col>
                <v-col cols="12" md="8">
                    <v-text-field
                        v-model="formData.url"
                        label="URL del servicio"
                        hint="La URL se usará para obtener el favicon automáticamente"
                        persistent-hint
                        variant="outlined"
                        density="comfortable"
                    />
                </v-col>
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
                            { title: 'Disney+', value: 'disney' },
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
                                <v-list-item-title>{{ item.title }}</v-list-item-title>
                            </v-list-item>
                        </template>
                    </v-select>
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
                        <v-col cols="12" md="6">
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
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="formData.paymentProvider"
                                :items="[
                                    'Visa',
                                    'Mastercard',
                                    'MercadoPago',
                                    'Google Play',
                                    'MODO',
                                    'PayPal'
                                ]"
                                label="Proveedor de pago"
                                required
                                :rules="[v => !!v || 'El proveedor es requerido']"
                                variant="outlined"
                                density="comfortable"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="formData.recurrence"
                                :items="[
                                    { title: 'Semanal', value: 'weekly' },
                                    { title: 'Mensual', value: 'monthly' },
                                    { title: 'Bimestral', value: 'bimonthly' },
                                    { title: 'Anual', value: 'yearly' },
                                    { title: 'Única vez', value: 'none' }
                                ]"
                                item-title="title"
                                item-value="value"
                                label="Recurrencia"
                                required
                                :rules="[v => !!v || 'La recurrencia es requerida']"
                                variant="outlined"
                                density="comfortable"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-switch
                                v-model="formData.autoRenew"
                                label="Renovación automática"
                                color="primary"
                                hide-details
                            />
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>

            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn
                    color="grey-darken-1"
                    variant="text"
                    data-test="cancel-button"
                    @click="closeDialog"
                >
                    Cancelar
                </v-btn>
                <v-btn
                    color="primary"
                    data-test="save-button"
                    @click="save"
                    :loading="loading"
                >
                    Guardar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
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

const formData = ref({
    name: props.service.name,
    defaultCurrency: props.service.defaultCurrency,
    category: props.service.category,
    paymentProvider: props.service.paymentProvider,
    recurrence: props.service.recurrence,
    autoRenew: props.service.autoRenew
});

const closeDialog = () => {
    show.value = false;
    emit('close');
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
