import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import PaymentHistory from '../views/PaymentHistory.vue';
import Analytics from '../views/Analytics.vue';
import Assistant from '../views/Assistant.vue';

const routes = [
  { path: '/', component: Dashboard },
  { path: '/history/:name?', component: PaymentHistory, props: true },
  { path: '/analytics', component: Analytics },
  { path: '/assistant', component: Assistant }
];

export default createRouter({
  history: createWebHistory(),
  routes
});
