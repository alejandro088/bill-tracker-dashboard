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
      
      <NotificationMenu :notifications="notifications" />
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
import ChatbotWidget from './components/ChatbotWidget.vue'
import NotificationMenu from './components/NotificationMenu.vue'
import api from './api.js'
import { formatDateRelative } from './utils/formatters'

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

    // Aplicar valores por defecto
    notifications.value = data.map(n => ({
      ...n,
      type: n.type || 'info',
      title: n.title || 'Notificación'
    }));
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

const getNotificationColor = (type) => {
  const colors = {
    'bill': 'primary',
    'payment': 'success',
    'reminder': 'warning',
    'alert': 'error',
    'info': 'info'
  }
  return colors[type] || 'grey'
}

const getNotificationIcon = (type) => {
  const icons = {
    'bill': 'mdi-file-document',
    'payment': 'mdi-cash',
    'reminder': 'mdi-clock',
    'alert': 'mdi-alert',
    'info': 'mdi-information'
  }
  return icons[type] || 'mdi-bell'
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
.sidebar v-list-item__prepend > .v-icon {
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

.notifications-menu {
  border-radius: 8px;
  overflow: hidden;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 4px;
  }
}

.notification-item {
  transition: background-color 0.2s ease;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  min-height: 85px;
  gap: 4px;
  
  &.unread {
    background-color: rgb(var(--v-theme-surface-variant));
  }
  
  &:hover {
    background-color: rgb(var(--v-theme-surface-variant));
  }

  &::v-deep(.v-list-item__content) {
    padding: 0;
  }

  .notification-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: rgb(var(--v-theme-on-surface));
    padding: 0;
  }

  .notification-message {
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.7);
    min-height: 20px;
    padding: 0;
  }

  .notification-date {
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin-top: auto;
    padding: 0;
  }
}

.empty-notifications {
  opacity: 0.7;
  
  .v-icon {
    display: block;
    margin: 0 auto;
    font-size: 24px;
  }
}

.view-more {
  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.04);
  }
  
  .view-more-text {
    color: rgb(var(--v-theme-primary));
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  &:hover .view-more-text {
    color: rgb(var(--v-theme-primary));
  }
}
</style>
