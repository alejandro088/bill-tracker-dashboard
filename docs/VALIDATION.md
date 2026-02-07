# Validación de Datos de Entrada

Este documento describe cómo usar el sistema de validación con Zod implementado en el proyecto.

---

## 🎯 Objetivo

Validar datos de entrada de forma robusta y consistente en todos los endpoints de la API, previniendo datos inválidos antes de que lleguen a los servicios y proporcionando mensajes de error claros.

---

## 🔧 Componentes

### 1. Schemas de Validación (`src/validation/schemas.js`)

Definiciones de Zod que especifican la estructura y reglas de validación para cada endpoint.

```javascript
import { z } from 'zod';

export const createBillSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(255),
  amount: z.number().positive('Monto debe ser positivo'),
  dueDate: z.union([dateSchema, dateOnlySchema]),
  // ...más campos
});
```

### 2. Middleware de Validación (`src/middleware/validate.js`)

Middleware reutilizable que aplica schemas de Zod a requests de Express.

```javascript
import { validate } from '../middleware/validate.js';

// Validar request body
router.post('/', validate(createBillSchema), controller.create);

// Validar query params
router.get('/', validate(billQuerySchema, 'query'), controller.getAll);

// Validar params de URL
router.get('/:id', validate(idParamSchema, 'params'), controller.getById);
```

---

## 📝 Uso en Rutas

### Validación de Body

```javascript
import { validate } from '../middleware/validate.js';
import { createServiceSchema } from '../validation/schemas.js';

router.post('/services', requireAuth, validate(createServiceSchema), create);
```

### Validación de Query Params

```javascript
import { validate } from '../middleware/validate.js';
import { billQuerySchema } from '../validation/schemas.js';

router.get('/bills', requireAuth, validate(billQuerySchema, 'query'), getAll);
```

### Validación Múltiple

```javascript
import { validateMultiple } from '../middleware/validate.js';

router.post(
  '/endpoint', 
  validateMultiple({
    body: createSchema,
    query: querySchema
  }),
  controller
);
```

---

## 🛠️ Schemas Disponibles

### Bills
- `createBillSchema` - Crear factura
- `updateBillSchema` - Actualizar factura
- `billQuerySchema` - Filtros y paginación

### Services
- `createServiceSchema` - Crear servicio
- `updateServiceSchema` - Actualizar servicio

### Payments
- `createPaymentSchema` - Crear pago
- `updatePaymentSchema` - Actualizar pago

### Accounts
- `createAccountSchema` - Crear cuenta
- `updateAccountSchema` - Actualizar cuenta
- `createIncomeSchema` - Registrar ingreso
- `createTransferSchema` - Crear transferencia
- `createWithdrawalSchema` - Registrar retiro

### Auth
- `registerSchema` - Registro de usuario
- `loginSchema` - Login

### Categories
- `createCategorySchema` - Crear categoría
- `updateCategorySchema` - Actualizar categoría

### Payment Methods
- `createPaymentMethodSchema` - Crear método de pago
- `updatePaymentMethodSchema` - Actualizar método de pago

---

## 📊 Tipos Comunes

### UUIDs
```javascript
const uuidSchema = z.string().uuid('ID inválido');
```

### Fechas
```javascript
const dateSchema = z.string().datetime().or(z.date());
const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
```

### Moneda
```javascript
const currencySchema = z.enum(['ARS', 'USD']);
```

### Estado de Factura
```javascript
const statusSchema = z.enum(['paid', 'pending', 'overdue']);
```

---

## ❌ Respuestas de Error

Cuando la validación falla, el middleware retorna un error 400 con detalles estructurados:

```json
{
  "error": "Datos de entrada inválidos",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    },
    {
      "field": "amount",
      "message": "Monto debe ser positivo"
    }
  ]
}
```

---

## 🔄 Transformación de Datos

Los schemas pueden transformar datos automáticamente:

```javascript
// Query params vienen como strings, se transforman a números
const billQuerySchema = z.object({
  page: z.string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional()
});

// Request: GET /bills?page=2
// Después de validación: req.query.page === 2 (número)
```

---

## 🎨 Crear Nuevos Schemas

### 1. Definir el Schema

```javascript
// src/validation/schemas.js

export const createExampleSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  email: z.string().email('Email inválido'),
  age: z.number().int().min(18, 'Debe ser mayor de 18'),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});
```

### 2. Aplicar en Ruta

```javascript
// src/routes/exampleRoutes.js

import { validate } from '../middleware/validate.js';
import { createExampleSchema } from '../validation/schemas.js';

router.post('/', validate(createExampleSchema), controller.create);
```

---

## 🧪 Validación Condicional

### Validación con Refine

```javascript
export const createTransferSchema = z.object({
  fromAccountId: z.string().uuid(),
  toAccountId: z.string().uuid(),
  amount: z.number().positive()
}).refine(data => data.fromAccountId !== data.toAccountId, {
  message: 'Las cuentas deben ser diferentes',
  path: ['toAccountId']
});
```

### Campos Opcionales vs Nullables

```javascript
// Opcional: puede omitirse
field: z.string().optional()

// Nullable: puede ser null
field: z.string().nullable()

// Ambos
field: z.string().optional().nullable()
```

---

## 📐 Validación Parcial

Para updates donde no todos los campos son requeridos:

```javascript
import { validatePartial } from '../middleware/validate.js';

// Todos los campos del schema son opcionales
router.put('/:id', validatePartial(updateSchema), controller.update);
```

---

## 🔍 Debugging

### Ver Errores de Validación

Los errores se loguean automáticamente con Winston:

```javascript
logWarn('Validation failed', {
  source: 'body',
  errors: [...],
  path: req.path,
  method: req.method
});
```

### Verificar Schemas en Desarrollo

```javascript
import { createBillSchema } from '../validation/schemas.js';

// Parsear y validar
try {
  const result = createBillSchema.parse(data);
  console.log('Válido:', result);
} catch (error) {
  console.error('Errores:', error.errors);
}
```

---

## ⚡ Performance

- Los schemas de Zod son muy eficientes
- La validación ocurre antes de cualquier operación de DB
- Datos transformados reemplazan los originales en `req.body/query/params`

---

## 🚫 Validaciones que NO hacer en Schemas

No uses schemas para:
- **Lógica de negocio**: Esto va en los servicios
- **Validaciones que requieren DB**: Usa servicios
- **Autenticación**: Usa middleware de auth

Schemas son solo para:
- Formato de datos
- Tipos
- Rangos numéricos
- Longitudes de strings
- Patrones (regex)
- Validaciones estructurales básicas

---

## 📚 Ejemplos Completos

### Endpoint de Creación

```javascript
// routes/billRoutes.js
import { validate } from '../middleware/validate.js';
import { createBillSchema } from '../validation/schemas.js';

router.post('/', 
  requireAuth,                    // 1. Autenticación
  validate(createBillSchema),     // 2. Validación
  controller.create               // 3. Lógica de negocio
);
```

### Endpoint con Query Params

```javascript
// routes/billRoutes.js
router.get('/', 
  requireAuth,
  validate(billQuerySchema, 'query'),
  controller.getAll
);

// Uso: GET /bills?page=1&limit=10&status=pending
// req.query será validado y transformado
```

### Endpoint con Múltiples Validaciones

```javascript
router.post('/complex', 
  requireAuth,
  validateMultiple({
    body: createSchema,
    query: z.object({ debug: z.string().optional() })
  }),
  controller.complex
);
```

---

## 🔗 Referencias

- [Zod Documentation](https://zod.dev/)
- [Schemas del proyecto](../src/validation/schemas.js)
- [Middleware de validación](../src/middleware/validate.js)

---

## ✅ Checklist para Nuevos Endpoints

- [ ] Definir schema en `src/validation/schemas.js`
- [ ] Exportar schema
- [ ] Importar en archivo de rutas
- [ ] Aplicar `validate()` middleware
- [ ] Probar con datos válidos
- [ ] Probar con datos inválidos
- [ ] Verificar mensajes de error
- [ ] Actualizar tests
