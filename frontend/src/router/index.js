import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import PaymentHistory from '../views/PaymentHistory.vue';
import Analytics from '../views/Analytics.vue';
import ServiceBills from '../views/ServiceBills.vue';
import Summary from '../views/Summary.vue';

const routes = [
  { path: '/', component: Dashboard },
  { path: '/services/:id', component: ServiceBills },
  { path: '/history/:name?', component: PaymentHistory, props: true },
  { path: '/analytics', component: Analytics },
  { path: '/summary', component: Summary }
];

export default createRouter({
  history: createWebHistory(),
  routes
});
