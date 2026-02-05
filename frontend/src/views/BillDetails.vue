<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <h2 class="text-h6">Factura #{{ bill?.id }} — {{ bill?.Service?.name || 'Servicio' }}</h2>
          <div class="text-subtitle-2 text-opacity-75">Detalle de la factura</div>
        </div>
        <div>
          <v-btn variant="text" @click="goBack" prepend-icon="mdi-arrow-left">Volver</v-btn>
        </div>
      </v-card-title>

      <v-card-text>
        <template v-if="loading">
          <v-progress-circular indeterminate />
        </template>

        <template v-else-if="error">
          <v-alert type="error">{{ error }}</v-alert>
        </template>

        <template v-else>
          <v-row>
            <v-col cols="12" md="6">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Nombre</v-list-item-title>
                  <v-list-item-subtitle>{{ bill?.name || bill?.Service?.name }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Descripción</v-list-item-title>
                  <v-list-item-subtitle>{{ bill?.description || '-' }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Monto</v-list-item-title>
                  <v-list-item-subtitle>{{ formatAmount(bill?.amount, bill?.currency) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Fecha de vencimiento</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(bill?.dueDate) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Estado</v-list-item-title>
                  <v-list-item-subtitle>{{ bill?.status || '-' }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-col>

            <v-col cols="12" md="6">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Servicio</v-list-item-title>
                  <v-list-item-subtitle>{{ bill?.Service?.name || '-' }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Categoría</v-list-item-title>
                  <v-list-item-subtitle>{{ bill?.Service?.Category?.name || '-' }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Recurrencia</v-list-item-title>
                  <v-list-item-subtitle>{{ bill?.Service?.recurrence || '-' }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Renovación automática</v-list-item-title>
                  <v-list-item-subtitle>{{ bill?.Service?.autoRenew ? 'Sí' : 'No' }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <h3 class="text-subtitle-1 mb-3">Historial de pagos</h3>
          <v-list two-line>
            <v-list-item v-for="p in bill?.payments || []" :key="p.id">
              <v-list-item-content>
                <v-list-item-title>{{ formatAmount(p.amount, p.currency) }}</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(p.paidAt) }} — {{ p.paymentMethodName || p.paymentMethod?.name || '-' }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="!(bill?.payments?.length)">
              <v-list-item-content>
                <v-list-item-title>No hay pagos registrados</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </template>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api.js';
import { formatAmount, formatDate } from '../utils/formatters';

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const bill = ref(null);
const loading = ref(false);
const error = ref('');

const fetchBill = async () => {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await api.get(`/bills/${id}`);
    bill.value = data;
  } catch (e) {
    error.value = (e?.response?.data?.message) || 'Error al cargar la factura';
  } finally {
    loading.value = false;
  }
};

const goBack = () => router.back();

onMounted(fetchBill);
</script>

<style scoped></style>
