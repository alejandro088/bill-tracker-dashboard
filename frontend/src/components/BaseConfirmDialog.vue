<template>
  <v-dialog v-model="isOpen" max-width="400" persistent>
    <v-card>
      <v-card-title class="text-h5">
        {{ title }}
      </v-card-title>

      <v-card-text>
        <slot>
          ¿Estás seguro de realizar esta acción?
        </slot>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="isOpen = false">Cancelar</v-btn>
        <v-btn color="error" text @click="confirm">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: 'Confirmar acción' }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const isOpen = ref(props.modelValue);

watch(() => props.modelValue, (val) => isOpen.value = val);
watch(isOpen, (val) => emit('update:modelValue', val));

const confirm = () => {
  emit('confirm');
  isOpen.value = false;
};
</script>
