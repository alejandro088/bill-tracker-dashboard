<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      :temporary="display.smAndDown"
    >
      <v-list nav>
        <v-list-item
          to="/"
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          :active="route.path === '/'"
        />
        <v-list-item
          to="/history"
          prepend-icon="mdi-history"
          title="History"
          :active="route.path.startsWith('/history')"
        />
        <v-list-item
          to="/analytics"
          prepend-icon="mdi-chart-bar"
          title="Analytics"
          :active="route.path.startsWith('/analytics')"
        />
        <v-list-item
          to="/assistant"
          prepend-icon="mdi-robot"
          title="Assistant"
          :active="route.path.startsWith('/assistant')"
        />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer" v-if="display.smAndDown" />
      <v-toolbar-title>Bill Tracker Dashboard</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container class="container">
        <router-view v-slot="{ Component }">
          <component :is="Component" @notify="showToast" />
        </router-view>
      </v-container>
    </v-main>
    <div v-if="toast" class="toast">{{ toast }}</div>
  </v-app>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'

const route = useRoute()
const display = useDisplay()
const drawer = ref(!display.smAndDown.value)
const toast = ref('')
let timer

watch(display.smAndDown, val => {
  if (!val) drawer.value = true
})

function showToast(msg) {
  toast.value = msg
  clearTimeout(timer)
  timer = setTimeout(() => (toast.value = ''), 3000)
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
