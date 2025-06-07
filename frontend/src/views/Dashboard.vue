<template>
  <div>
    <SummaryWidget />
    <BillForm @added="refresh" />
    <BillTable :key="refreshKey" @notify="notify" />
  </div>
</template>

<script setup>
import BillTable from '../components/BillTable.vue';
import BillForm from '../components/BillForm.vue';
import SummaryWidget from '../components/SummaryWidget.vue';
import { ref } from 'vue';

const emit = defineEmits(['notify']);
const refreshKey = ref(0);

function refresh() {
  refreshKey.value++;
}

function notify(msg) {
  emit('notify', msg);
}
</script>
