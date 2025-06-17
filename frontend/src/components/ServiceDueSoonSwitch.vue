<template>
    <v-row class="mb-4">
        <v-col cols="12" class="d-flex align-center">
            <v-switch
                :model-value="modelValue"
                density="compact"
                label="Mostrar sólo servicios con vencimientos en los próximos 7 días"
                color="warning"
                hide-details
                @update:model-value="$emit('update:modelValue', $event)"
            />
        </v-col>
    </v-row>
</template>

<script setup>
defineProps({
    modelValue: {
        type: Boolean,
        required: true
    }
});

defineEmits(['update:modelValue']);
</script>
