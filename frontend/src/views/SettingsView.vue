<template>
  <v-container>
    <v-card class="mb-4">
      <v-card-title class="header-card pa-4">
        <div>
          <h2 class="text-h5 font-weight-medium mb-1 text-white">
            Configuración
          </h2>
          <div class="text-subtitle-2 text-white text-opacity-75">
            Administración de categorías y métodos de pago
          </div>
        </div>
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          to="/"
          class="text-white"
          prepend-icon="mdi-arrow-left"
        >
          Volver
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- Tabs para alternar entre categorías y métodos de pago -->
    <v-tabs v-model="activeTab" centered class="mb-6">
      <v-tab value="categories">
        <v-icon start>mdi-tag-multiple</v-icon>
        Categorías
      </v-tab>
      <v-tab value="paymentMethods">
        <v-icon start>mdi-credit-card-multiple</v-icon>
        Métodos de Pago
      </v-tab>
      <v-tab value="accounts">
        <v-icon start>mdi-bank</v-icon>
        Cuentas
      </v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <!-- Pestaña de Categorías -->
      <v-window-item value="categories">
        <v-card>
          <v-card-title class="d-flex align-center">
            Categorías
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              prepend-icon="mdi-plus"
              @click="showAddCategoryDialog = true"
            >
              Nueva Categoría
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-progress-linear v-if="loadingCategories" indeterminate></v-progress-linear>
            <v-alert v-else-if="error" type="error" dense>{{ error }}</v-alert>
            <v-data-table
              v-else
              :headers="categoryHeaders"
              :items="categories"
              class="elevation-1"
            >
              <template #item.color="{ item }">
                <v-chip
                  :color="item.color || 'primary'"
                  size="small"
                >{{ item.color || 'N/A' }}</v-chip>
              </template>
              <template #item.icon="{ item }">
                <v-icon v-if="item.icon">{{ item.icon }}</v-icon>
                <span v-else>N/A</span>
              </template>
              <template #item.actions="{ item }">
                <div class="d-flex gap-1">
                  <v-btn
                    color="info"
                    icon
                    size="small"
                    @click="editCategory(item)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    color="error"
                    icon
                    size="small"
                    @click="confirmDeleteCategory(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- Pestaña de Métodos de Pago -->
      <v-window-item value="paymentMethods">
        <v-card>
          <v-card-title class="d-flex align-center">
            Métodos de Pago
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              prepend-icon="mdi-plus"
              @click="showAddProviderDialog = true"
            >
              Nuevo Método de Pago
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-progress-linear v-if="loadingProviders" indeterminate></v-progress-linear>
            <v-alert v-else-if="error" type="error" dense>{{ error }}</v-alert>
            <v-data-table
              v-else
              :headers="providerHeaders"
              :items="providers"
              class="elevation-1"
            >
              <template #item.icon="{ item }">
                <v-icon v-if="item.icon">{{ item.icon }}</v-icon>
                <span v-else>N/A</span>
              </template>
              <template #item.actions="{ item }">
                <div class="d-flex gap-1">
                  <v-btn
                    color="info"
                    icon
                    size="small"
                    @click="editProvider(item)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    color="error"
                    icon
                    size="small"
                    @click="confirmDeleteProvider(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-window-item>
      
      <!-- Pestaña de Cuentas -->
      <v-window-item value="accounts">
        <AccountManager />
      </v-window-item>
    </v-window>

    <!-- Diálogo para agregar/editar categoría -->
    <v-dialog v-model="showAddCategoryDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ editingCategory ? 'Editar Categoría' : 'Nueva Categoría' }}</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newCategory.name"
                  label="Nombre"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newCategory.description"
                  label="Descripción"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newCategory.color"
                  label="Color (HEX)"
                  hint="Ejemplo: #FF5733"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newCategory.icon"
                  label="Ícono"
                  hint="Nombre del ícono (mdi-)"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="showAddCategoryDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="success"
            variant="text"
            @click="saveCategory"
            :loading="savingCategory"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para agregar/editar método de pago -->
    <v-dialog v-model="showAddProviderDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ editingProvider ? 'Editar Método de Pago' : 'Nuevo Método de Pago' }}</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newProvider.name"
                  label="Nombre"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newProvider.description"
                  label="Descripción"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newProvider.icon"
                  label="Ícono"
                  hint="Nombre del ícono (mdi-)"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="showAddProviderDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="success"
            variant="text"
            @click="saveProvider"
            :loading="savingProvider"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación para eliminar categoría -->
    <v-dialog v-model="showDeleteCategoryDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirmar eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas eliminar la categoría <strong>{{ categoryToDelete?.name }}</strong>?
          <p class="text-caption mt-2">
            Las categorías en uso por pagos existentes no podrán ser eliminadas.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="showDeleteCategoryDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="deleteCategory"
            :loading="deletingCategory"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación para eliminar método de pago -->
    <v-dialog v-model="showDeleteProviderDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirmar eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas eliminar el método de pago <strong>{{ providerToDelete?.name }}</strong>?
          <p class="text-caption mt-2">
            Los métodos de pago en uso por pagos existentes no podrán ser eliminados.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="showDeleteProviderDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="deleteProvider"
            :loading="deletingProvider"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api.js';
import AccountManager from '../components/AccountManager.vue';

// Estado de las pestañas
const activeTab = ref('categories');

// Estado de carga
const loadingCategories = ref(false);
const loadingProviders = ref(false);
const savingCategory = ref(false);
const savingProvider = ref(false);
const deletingCategory = ref(false);
const deletingProvider = ref(false);
const error = ref(null);

// Datos
const categories = ref([]);
const providers = ref([]);

// Diálogos
const showAddCategoryDialog = ref(false);
const showAddProviderDialog = ref(false);
const showDeleteCategoryDialog = ref(false);
const showDeleteProviderDialog = ref(false);

// Edición
const editingCategory = ref(false);
const editingProvider = ref(false);
const categoryToDelete = ref(null);
const providerToDelete = ref(null);

// Nuevos elementos
const newCategory = ref({
  id: null,
  name: '',
  description: '',
  color: '',
  icon: ''
});

const newProvider = ref({
  id: null,
  name: '',
  description: '',
  icon: ''
});

// Cabeceras para las tablas
const categoryHeaders = [
  { title: 'Nombre', key: 'name' },
  { title: 'Descripción', key: 'description' },
  { title: 'Color', key: 'color' },
  { title: 'Ícono', key: 'icon' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' }
];

const providerHeaders = [
  { title: 'Nombre', key: 'name' },
  { title: 'Descripción', key: 'description' },
  { title: 'Ícono', key: 'icon' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' }
];

// Funciones para cargar datos
const fetchCategories = async () => {
  loadingCategories.value = true;
  try {
    const { data } = await api.get('/categories');
    categories.value = data;
    error.value = null;
  } catch (err) {
    error.value = 'Error al cargar categorías: ' + err.message;
  } finally {
    loadingCategories.value = false;
  }
};

const fetchProviders = async () => {
  loadingProviders.value = true;
  try {
    const { data } = await api.get('/payment-methods');
    providers.value = data;
    error.value = null;
  } catch (err) {
    error.value = 'Error al cargar métodos de pago: ' + err.message;
  } finally {
    loadingProviders.value = false;
  }
};

// Funciones para guardar
const saveCategory = async () => {
  if (!newCategory.value.name) {
    error.value = 'El nombre de la categoría es obligatorio';
    return;
  }
  
  savingCategory.value = true;
  try {
    if (editingCategory.value) {
      await api.put(`/categories/${newCategory.value.id}`, newCategory.value);
    } else {
      // Creamos una copia sin el campo id para evitar enviarlo al backend
      const { id, ...categoryData } = newCategory.value;
      await api.post('/categories', categoryData);
    }
    
    await fetchCategories();
    showAddCategoryDialog.value = false;
    resetCategoryForm();
    error.value = null;
  } catch (err) {
    error.value = 'Error al guardar la categoría: ' + err.message;
  } finally {
    savingCategory.value = false;
  }
};

const saveProvider = async () => {
  if (!newProvider.value.name) {
    error.value = 'El nombre del método de pago es obligatorio';
    return;
  }
  
  savingProvider.value = true;
  try {
    if (editingProvider.value) {
      await api.put(`/payment-methods/${newProvider.value.id}`, newProvider.value);
    } else {
      // Creamos una copia sin el campo id para evitar enviarlo al backend
      const { id, ...providerData } = newProvider.value;
      await api.post('/payment-methods', providerData);
    }
    
    await fetchProviders();
    showAddProviderDialog.value = false;
    resetProviderForm();
    error.value = null;
  } catch (err) {
    error.value = 'Error al guardar el método de pago: ' + err.message;
  } finally {
    savingProvider.value = false;
  }
};

// Funciones para editar
const editCategory = (category) => {
  editingCategory.value = true;
  newCategory.value = { ...category };
  showAddCategoryDialog.value = true;
};

const editProvider = (provider) => {
  editingProvider.value = true;
  newProvider.value = { ...provider };
  showAddProviderDialog.value = true;
};

// Funciones para eliminar
const confirmDeleteCategory = (category) => {
  categoryToDelete.value = category;
  showDeleteCategoryDialog.value = true;
};

const confirmDeleteProvider = (provider) => {
  providerToDelete.value = provider;
  showDeleteProviderDialog.value = true;
};

const deleteCategory = async () => {
  if (!categoryToDelete.value) return;
  
  deletingCategory.value = true;
  try {
    await api.delete(`/categories/${categoryToDelete.value.id}`);
    await fetchCategories();
    showDeleteCategoryDialog.value = false;
    categoryToDelete.value = null;
    error.value = null;
  } catch (err) {
    error.value = 'Error al eliminar la categoría: ' + err.message;
  } finally {
    deletingCategory.value = false;
  }
};

const deleteProvider = async () => {
  if (!providerToDelete.value) return;
  
  deletingProvider.value = true;
  try {
    await api.delete(`/payment-methods/${providerToDelete.value.id}`);
    await fetchProviders();
    showDeleteProviderDialog.value = false;
    providerToDelete.value = null;
    error.value = null;
  } catch (err) {
    error.value = 'Error al eliminar el método de pago: ' + err.message;
  } finally {
    deletingProvider.value = false;
  }
};

// Funciones de reseteo de formularios
const resetCategoryForm = () => {
  newCategory.value = {
    id: null,
    name: '',
    description: '',
    color: '',
    icon: ''
  };
  editingCategory.value = false;
};

const resetProviderForm = () => {
  newProvider.value = {
    id: null,
    name: '',
    description: '',
    icon: ''
  };
  editingProvider.value = false;
};

// Cargar datos al montar el componente
onMounted(async () => {
  await Promise.all([fetchCategories(), fetchProviders()]);
});
</script>

<style scoped>
.header-card {
  background: linear-gradient(135deg, #ff9f43 0%, #ff7b1e 100%) !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-card :deep(.v-btn) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.header-card :deep(.v-btn:hover) {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.v-tabs {
  background-color: #f5f5f5;
  border-radius: 8px;
}
</style>
