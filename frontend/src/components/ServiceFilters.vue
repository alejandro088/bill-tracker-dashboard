<template>
    <div>
        <v-row class="mb-4">
            <v-col cols="12" md="3">
                <div class="filter-label">
                    <v-icon size="18" class="mr-2">mdi-magnify</v-icon>
                    <span>Buscar</span>
                </div>
                <v-text-field
                    :model-value="search"
                    placeholder="Buscar servicio"
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                    @update:model-value="$emit('update:search', $event)"
                />
            </v-col>
            <v-col cols="12" md="2">
                <div class="filter-label">
                    <v-icon size="18" class="mr-2">mdi-shape</v-icon>
                    <span>Categoría</span>
                </div>
                <v-select
                    :model-value="category"
                    :items="categories"
                    item-title="title"
                    item-value="value"
                    placeholder="Todas"
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                    @update:model-value="$emit('update:category', $event === null ? '' : $event)"
                    :loading="loadingCategories"
                />
            </v-col>
            <v-col cols="12" md="2">
                <div class="filter-label">
                    <v-icon size="18" class="mr-2">mdi-currency-usd</v-icon>
                    <span>Moneda</span>
                </div>
                <v-select
                    :model-value="currency"
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
                    @update:model-value="$emit('update:currency', $event)"
                />
            </v-col>
            <v-col cols="12" md="2">
                <div class="filter-label">
                    <v-icon size="18" class="mr-2">mdi-calendar-refresh</v-icon>
                    <span>Recurrencia</span>
                </div>
                <v-select
                    :model-value="recurrence"
                    :items="recurrenceOptions"
                    item-title="title"
                    item-value="value"
                    placeholder="Todas"
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                    @update:model-value="$emit('update:recurrence', $event === null ? '' : $event)"
                />
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
const props = defineProps({
    search: String,
    category: String,
    currency: String,
    recurrence: String
});

const emit = defineEmits([
    'update:search',
    'update:category',
    'update:currency',
    'update:recurrence'
]);

import { ref, onMounted } from 'vue';
import api from '../api.js';

// Estado para las categorías
const categories = ref([{ title: 'Todas', value: '' }]);
const loadingCategories = ref(false);

// Cargar categorías desde el backend
const fetchCategories = async () => {
    loadingCategories.value = true;
    try {
        const { data } = await api.get('/categories');
        // Transformar los datos al formato requerido por v-select
        const categoryItems = data.map(cat => ({
            title: cat.name,
            value: cat.id,
            description: cat.description,
            color: cat.color,
            icon: cat.icon
        }));
        categories.value = [{ title: 'Todas', value: '' }, ...categoryItems];
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        categories.value = [
            { title: 'Todas', value: '' },
            { title: 'Servicios', value: 'utilities' },
            { title: 'Suscripciones', value: 'subscriptions' },
            { title: 'Impuestos', value: 'taxes' },
            { title: 'Otros', value: 'others' }
        ];
    } finally {
        loadingCategories.value = false;
    }
};

// Cargar datos al montar el componente
onMounted(() => {
    fetchCategories();
});

const recurrenceOptions = [
    { title: 'Todas', value: '' },
    { title: 'Semanal', value: 'weekly' },
    { title: 'Mensual', value: 'monthly' },
    { title: 'Bimestral', value: 'bimonthly' },
    { title: 'Anual', value: 'yearly' },
    { title: 'Única vez', value: 'none' },
];
</script>
