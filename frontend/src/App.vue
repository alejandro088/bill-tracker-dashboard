<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      class="sidebar"
      permanent
    >
      <div class="sidebar-header">
        <!-- <v-avatar size="40" class="mr-2">
          <v-img src="/logo.png" alt="Logo" />
        </v-avatar> -->
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
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn icon class="mx-2" v-bind="props">
            <v-badge :content="notifications.length" color="red" overlap v-if="notifications.length">
              <v-icon>mdi-bell</v-icon>
            </v-badge>
            <v-icon v-else>mdi-bell</v-icon>
          </v-btn>
        </template>
        <v-list style="min-width: 250px; max-width: 350px;">
          <v-list-item v-if="!notifications.length">
            <v-list-item-title class="text-grey">Sin notificaciones</v-list-item-title>
          </v-list-item>
          <v-list-item v-for="(n, i) in notifications" :key="i">
            <v-list-item-title>{{ n.message || n }}</v-list-item-title>
            <v-list-item-subtitle v-if="n.createdAt">{{ new Date(n.createdAt).toLocaleString() }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn icon class="mx-2">
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="container">
        <router-view v-slot="{ Component }">
          <component :is="Component" @notify="showNotification" />
        </router-view>
      </v-container>
    </v-main>
    <div v-if="toast" class="toast">{{ toast }}</div>
    <div v-if="showNewNotification" class="new-notification-toast">
      Tienes una nueva notificación
    </div>
    <ChatbotWidget />
  </v-app>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import ChatbotWidget from './components/ChatbotWidget.vue'
import api from './api.js'

const route = useRoute()
const drawer = ref(true)
const toast = ref('')
const search = ref('')
const notifications = ref([])
const showNewNotification = ref(false)
let timer
let notifTimer

onMounted(async () => {
  try {
    const { data } = await api.get('/notifications')
    notifications.value = data || []
  } catch (e) {
    // Si falla, deja el array vacío
    notifications.value = []
  }
})

function showToast(msg) {
  toast.value = msg
  clearTimeout(timer)
  timer = setTimeout(() => (toast.value = ''), 3000)
}

function showNotification(msg) {
  notifications.value.unshift({ message: msg, createdAt: new Date().toISOString() })
  showToast(msg)
  showNewNotification.value = true
  clearTimeout(notifTimer)
  notifTimer = setTimeout(() => (showNewNotification.value = false), 3500)
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
.sidebar .v-list-item {
  border-radius: 6px;
  margin: 4px 8px;
  color: #fff;
}
.sidebar .v-list-item--active {
  background: #1976d2 !important;
  color: #fff !important;
}
..sidebar v-list-item__prepend > .v-icon {
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
.new-notification-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1976d2;
  color: #fff;
  padding: 14px 24px;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: bold;
  box-shadow: 0 2px 12px rgba(0,0,0,0.18);
  z-index: 9999;
  animation: fadeInOut 3.5s;
}
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(20px); }
}
</style>
