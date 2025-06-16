<template>
  <v-tooltip text="Editar servicio">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon="mdi-pencil"
        size="small"
        variant="flat"
        color="info"
        @click="$emit('edit', service)"
      />
    </template>
  </v-tooltip>
  
  <v-tooltip text="Agregar factura">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon="mdi-cash-plus"
        size="small"
        variant="flat"
        color="success"
        @click="$emit('add-bill', service)"
      />
    </template>
  </v-tooltip>
  
  <v-tooltip text="Eliminar servicio">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon="mdi-delete"
        size="small"
        variant="flat"
        color="error"
        @click="$emit('delete', service)"
      />
    </template>
  </v-tooltip>
</template>

<script setup>
defineProps({
  service: {
    type: Object,
    required: true
  }
});

defineEmits(['edit', 'delete', 'add-bill']);
</script>