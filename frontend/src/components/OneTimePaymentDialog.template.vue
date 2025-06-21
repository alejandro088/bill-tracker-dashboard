&lt;template>
  &lt;v-dialog v-model="dialog" max-width="500px">
    &lt;template v-slot:activator="{ props }">
      &lt;v-btn
        color="primary"
        v-bind="props"
        prepend-icon="mdi-plus"
      >
        Pago Único
      &lt;/v-btn>
    &lt;/template>

    &lt;v-card>
      &lt;v-card-title>
        &lt;span class="text-h5">Crear Pago Único&lt;/span>
      &lt;/v-card-title>

      &lt;v-card-text>
        &lt;v-form ref="form" v-model="valid">
          &lt;v-container>
            &lt;v-row>
              &lt;v-col cols="12" sm="6">
                &lt;v-text-field
                  v-model="payment.amount"
                  label="Monto"
                  type="number"
                  required
                  :rules="[v => !!v || 'El monto es requerido']"
                >&lt;/v-text-field>
              &lt;/v-col>
              
              &lt;v-col cols="12" sm="6">
                &lt;v-select
                  v-model="payment.currency"
                  :items="currencies"
                  label="Moneda"
                  required
                  :rules="[v => !!v || 'La moneda es requerida']"
                >&lt;/v-select>
              &lt;/v-col>

              &lt;v-col cols="12">
                &lt;v-select
                  v-model="payment.category"
                  :items="categories"
                  label="Categoría"
                  required
                  :rules="[v => !!v || 'La categoría es requerida']"
                >&lt;/v-select>
              &lt;/v-col>

              &lt;v-col cols="12">
                &lt;v-text-field
                  v-model="payment.description"
                  label="Descripción"
                  required
                  :rules="[v => !!v || 'La descripción es requerida']"
                >&lt;/v-text-field>
              &lt;/v-col>

              &lt;v-col cols="12">
                &lt;v-select
                  v-model="payment.paymentProvider"
                  :items="paymentProviders"
                  label="Método de pago"
                  required
                  :rules="[v => !!v || 'El método de pago es requerido']"
                >&lt;/v-select>
              &lt;/v-col>
            &lt;/v-row>
          &lt;/v-container>
        &lt;/v-form>
      &lt;/v-card-text>

      &lt;v-card-actions>
        &lt;v-spacer>&lt;/v-spacer>
        &lt;v-btn color="error" @click="close">Cancelar&lt;/v-btn>
        &lt;v-btn color="primary" :disabled="!valid" @click="save">Guardar&lt;/v-btn>
      &lt;/v-card-actions>
    &lt;/v-card>
  &lt;/v-dialog>
&lt;/template>
