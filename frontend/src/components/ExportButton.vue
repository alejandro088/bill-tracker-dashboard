&lt;template&gt;
  &lt;v-btn
    color="primary"
    prepend-icon="mdi-download"
    :loading="loading"
    @click="exportData"
  &gt;
    {{ label }}
  &lt;/v-btn&gt;
&lt;/template&gt;

&lt;script setup&gt;
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
&lt;/script&gt;
