<template>
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
            <BillForm @added="$emit('refresh')" @notify="$emit('notify', $event)" />
        </v-card-title>
    </v-card>
</template>

<script setup>
import BillForm from './BillForm.vue';

defineEmits(['refresh', 'notify']);
</script>

<style scoped>
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
</style>
