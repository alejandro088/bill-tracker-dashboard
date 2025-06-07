<template>
  <v-app>
    <v-main>
      <v-container class="container">
      <h1>Bill Tracker Dashboard</h1>
      <v-tabs v-model="tab" grow @update:modelValue="navigate">
        <v-tab value="/">Dashboard</v-tab>
        <v-tab value="/history">History</v-tab>
        <v-tab value="/analytics">Analytics</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item value="/">
          <router-view v-slot="{ Component }" v-if="tab === '/'">
            <component :is="Component" @notify="showToast" />
          </router-view>
        </v-tab-item>
        <v-tab-item value="/history">
          <router-view v-slot="{ Component }" v-if="tab === '/history'">
            <component :is="Component" @notify="showToast" />
          </router-view>
        </v-tab-item>
        <v-tab-item value="/analytics">
          <router-view v-slot="{ Component }" v-if="tab === '/analytics'">
            <component :is="Component" @notify="showToast" />
          </router-view>
        </v-tab-item>
      </v-tabs-items>
      <div v-if="toast" class="toast">{{ toast }}</div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const toast = ref('');
let timer;
const tab = ref('/');
const route = useRoute();
const router = useRouter();

watch(
  () => route.path,
  (val) => {
    if (val.startsWith('/analytics')) tab.value = '/analytics';
    else if (val.startsWith('/history')) tab.value = '/history';
    else tab.value = '/';
  },
  { immediate: true }
);

function navigate(value) {
  if (value !== route.path) {
    router.push(value);
  }
}

function showToast(msg) {
  toast.value = msg;
  clearTimeout(timer);
  timer = setTimeout(() => (toast.value = ''), 3000);
}
</script>

<style>
.container {
  max-width: 900px;
  margin: auto;
  padding: 20px;
  font-family: Arial, Helvetica, sans-serif;
}
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #333;
  color: #fff;
  padding: 10px 15px;
  border-radius: 4px;
}
</style>
