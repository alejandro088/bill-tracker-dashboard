<template>
  <div class="account-detail">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <div>
                <h2>{{ account.name || 'Cuenta' }}</h2>
                <div class="muted">Saldo: {{ formatCurrency(account.balance, account.currency) }}</div>
              </div>
            </v-card-title>
            <v-card-text>
              <div v-if="loading">Cargando movimientos...</div>
              <div v-else>
                <v-tabs v-model="tab" background-color="transparent">
                  <v-tab key="payments">Pagos</v-tab>
                  <v-tab key="incomes">Ingresos / Egresos</v-tab>
                  <v-tab key="transfers">Transferencias</v-tab>
                </v-tabs>

                <div v-show="tab === 0">
                  <v-list two-line>
                    <v-list-item v-for="p in payments" :key="p.id">
                      <v-list-item-content>
                        <v-list-item-title>{{ p.description || p.category || 'Pago' }}</v-list-item-title>
                        <v-list-item-subtitle>{{ formatDate(p.paidAt) }} • {{ p.PaymentMethods?.name || p.paymentMethodId || '' }}</v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <div :class="{ 'text-success': p.amount>0, 'text-error': p.amount<0 }">{{ formatCurrency(p.amount, p.currency) }}</div>
                      </v-list-item-action>
                    </v-list-item>
                    <div v-if="payments.length===0" class="muted">No hay pagos asociados a esta cuenta.</div>
                  </v-list>
                </div>

                <div v-show="tab === 1">
                  <v-list two-line>
                    <v-list-item v-for="inc in incomes" :key="inc.id">
                      <v-list-item-content>
                        <v-list-item-title>{{ inc.description || (inc.amount<0 ? 'Egreso' : 'Ingreso') }}</v-list-item-title>
                        <v-list-item-subtitle>{{ formatDate(inc.createdAt || inc.date) }}</v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <div :class="{ 'text-success': inc.amount>0, 'text-error': inc.amount<0 }">{{ formatCurrency(inc.amount, account.currency || inc.currency) }}</div>
                      </v-list-item-action>
                    </v-list-item>
                    <div v-if="incomes.length===0" class="muted">No hay ingresos/egresos en esta cuenta.</div>
                  </v-list>
                </div>

                <div v-show="tab === 2">
                  <v-list two-line>
                    <v-list-item v-for="t in transfers" :key="t.id">
                      <v-list-item-content>
                        <v-list-item-title>{{ t.description || 'Transferencia' }}</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ formatDate(t.transferDate) }} • De: {{ t.fromAccount?.name || t.fromAccountId }} → A: {{ t.toAccount?.name || t.toAccountId }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <div>{{ formatCurrency(t.amount, t.currency || account.currency) }}</div>
                      </v-list-item-action>
                    </v-list-item>
                    <div v-if="transfers.length===0" class="muted">No hay transferencias para esta cuenta.</div>
                  </v-list>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api.js';

export default {
  name: 'AccountDetail',
  setup() {
    const route = useRoute();
    const accountId = route.params.id;
    const account = ref({});
    const payments = ref([]);
    const incomes = ref([]);
    const transfers = ref([]);
    const loading = ref(true);
    const tab = ref(0);

    const formatCurrency = (amount, currency) => {
      try {
        if (amount === null || amount === undefined) return '-';
        const c = currency || 'ARS';
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: c }).format(amount);
      } catch (e) {
        return amount;
      }
    };

    const formatDate = (d) => {
      if (!d) return '';
      const date = new Date(d);
      return date.toLocaleString('es-ES');
    };

    const load = async () => {
      loading.value = true;
      try {
        const [accRes, incomesRes, transfersRes, paymentsRes] = await Promise.all([
          api.get(`/accounts/${accountId}`),
          api.get('/accounts/incomes'),
          api.get('/accounts/transfers'),
          api.get('/payments')
        ]);

        account.value = accRes.data || {};

        // Filtrar incomes por accountId
        incomes.value = (incomesRes.data || []).filter(i => i.accountId === accountId || (i.account && i.account.id === accountId));

        // Filtrar transfers por accountId
        transfers.value = (transfersRes.data || []).filter(t => t.fromAccountId === accountId || t.toAccountId === accountId);

        // Determinar paymentMethodIds de la cuenta y filtrar pagos
        const pmIds = (account.value.paymentMethods || []).map(p => p.id);
        payments.value = (paymentsRes.data || []).filter(p => pmIds.includes(p.paymentMethodId));

      } catch (err) {
        console.error('AccountDetail: carga fallida', err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(load);

    return { account, payments, incomes, transfers, loading, tab, formatCurrency, formatDate };
  }
};
</script>

<style scoped>
.muted { color: #666; }
.text-success { color: #2e7d32; }
.text-error { color: #c62828; }
</style>
