import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import PaymentHistory from '../views/PaymentHistory.vue';
import Analytics from '../views/Analytics.vue';
import ServiceBills from '../views/ServiceBills.vue';
import Summary from '../views/Summary.vue';
import NotificationPanel from '../views/NotificationPanel.vue';
import SettingsView from '../views/SettingsView.vue';
import FinanceManager from '../views/FinanceManager.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

const routes = [
  { path: '/', component: Dashboard },
  { path: '/services/:id', component: ServiceBills },
  { path: '/history/:name?', component: PaymentHistory, props: true },
  { path: '/analytics', component: Analytics },
  { path: '/summary', component: Summary },
  { path: '/notifications', component: NotificationPanel },
  { path: '/settings', component: SettingsView, meta: { requiresAuth: true } },
  { path: '/finance', component: FinanceManager, meta: { requiresAuth: true } },
  { path: '/login', component: Login, meta: { layout: 'auth' } },
  { path: '/register', component: Register, meta: { layout: 'auth' } }
];

export default createRouter({
  history: createWebHistory(),
  routes
});
