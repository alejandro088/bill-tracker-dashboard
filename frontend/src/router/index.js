import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import PaymentHistory from '../views/PaymentHistory.vue';
import Analytics from '../views/Analytics.vue';

const routes = [
  { path: '/', component: Dashboard },
  { path: '/history/:name', component: PaymentHistory, props: true },
  { path: '/analytics', component: Analytics }
];

export default createRouter({
  history: createWebHistory(),
  routes
});
