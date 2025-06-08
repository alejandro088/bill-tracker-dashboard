<template>
  <div>
    <SummaryWidget />
    <BillForm @added="refresh" @notify="notify" />
    <ServiceList :key="refreshKey" />
  </div>
</template>

<script setup>
import ServiceList from '../components/ServiceList.vue';
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
