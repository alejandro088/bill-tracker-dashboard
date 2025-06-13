<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      class="sidebar"
      permanent
    >
      <div class="sidebar-header">
        <v-avatar size="40" class="mr-2">
          <v-img src="/logo.png" alt="Logo" />
        </v-avatar>
        <span class="sidebar-title">Bill Tracker</span>
      </div>
      <v-divider class="mb-2" />
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
          title="Historial"
          :active="route.path.startsWith('/history')"
        />
        <v-list-item
          to="/analytics"
          prepend-icon="mdi-chart-bar"
          title="Analíticas"
          :active="route.path.startsWith('/analytics')"
        />
        <v-list-item
          to="/summary"
          prepend-icon="mdi-table"
          title="Resumen"
          :active="route.path.startsWith('/summary')"
        />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app class="app-bar">
      <v-toolbar-title>Bill Tracker Dashboard</v-toolbar-title>
      <v-spacer />
      <v-text-field
        v-model="search"
        placeholder="Buscar..."
        hide-details
        dense
        solo-inverted
        prepend-inner-icon="mdi-magnify"
        class="search-bar"
      />
      <v-btn icon class="mx-2">
        <v-badge content="5" color="red" overlap>
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>
      <v-btn icon class="mx-2">
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="container">
        <router-view v-slot="{ Component }">
          <component :is="Component" @notify="showToast" />
        </router-view>
      </v-container>
    </v-main>
    <div v-if="toast" class="toast">{{ toast }}</div>
    <ChatbotWidget />
  </v-app>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import ChatbotWidget from './components/ChatbotWidget.vue'

const route = useRoute()
const drawer = ref(true)
const toast = ref('')
const search = ref('')
let timer

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
.sidebar {
  background: #181c24 !important;
  color: #fff;
  min-width: 220px;
  box-shadow: 6px 0 24px 0 rgba(0,0,0,0.35), 1px 0 0 0 #222;
  z-index: 10;
}
.sidebar-header {
  display: flex;
  align-items: center;
  padding: 20px 16px 10px 16px;
}
.sidebar-title {
  font-size: 1.3rem;
  font-weight: bold;
  letter-spacing: 1px;
  color: #fff;
}
.v-list-item {
  border-radius: 6px;
  margin: 4px 8px;
  color: #fff !important;
}
.v-list-item--active {
  background: #1976d2 !important;
  color: #fff !important;
}
.v-list-item__prepend > .v-icon {
  color: #fff !important;
}
.app-bar {
  background: #fff;
  color: #222d32;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.search-bar {
  max-width: 220px;
  margin-right: 16px;
}
.v-main {
  background: #fff !important;
  margin-left: 8px;
  min-height: 100vh;
  transition: margin-left 0.2s;
}
</style>
