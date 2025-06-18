<template>
  <v-btn
    color="primary"
    variant="elevated"
    prepend-icon="mdi-download"
    :loading="loading"
    @click="exportData"
  >
    {{ label }}
  </v-btn>
</template>

<script setup>
import { ref } from 'vue'
import exportFromJSON from 'export-from-json'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  filename: {
    type: String,
    default: 'export'
  },
  label: {
    type: String,
    default: 'Export'
  }
})

const loading = ref(false)

const exportData = async () => {
  try {
    console.log(props.data)
    loading.value = true
    const fileName = `${props.filename}_${new Date().toISOString().split('T')[0]}`
    exportFromJSON({
      data: props.data,
      fileName,
      exportType: 'csv'
    })
  } catch (error) {
    console.error('Error exporting data:', error)
  } finally {
    loading.value = false
  }
}
</script>
