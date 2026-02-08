import { z } from 'zod';

// ============================================================================
// SCHEMAS COMUNES
// ============================================================================

const uuidSchema = z.string().uuid('ID inválido');
const dateSchema = z.string().datetime({ message: 'Fecha inválida' }).or(z.date());
const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha debe ser YYYY-MM-DD');
const currencySchema = z.enum(['ARS', 'USD'], { message: 'Moneda debe ser ARS o USD' });
const statusSchema = z.enum(['paid', 'pending', 'overdue'], { message: 'Estado inválido' });
const recurrenceSchema = z.enum(['weekly', 'monthly', 'bimonthly', 'yearly', 'none'], { 
  message: 'Recurrencia inválida' 
});

// ============================================================================
// BILLS
// ============================================================================

export const createBillSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(255, 'Nombre muy largo'),
  description: z.string().max(1000, 'Descripción muy larga').optional(),
  amount: z.number().positive('Monto debe ser positivo'),
  currency: currencySchema.optional(),
  dueDate: z.union([dateSchema, dateOnlySchema]),
  category: z.string().optional(),
  serviceId: uuidSchema.optional(),
  recurrence: recurrenceSchema.optional(),
  autoRenew: z.boolean().optional(),
  paymentProvider: z.string().max(100).optional()
});

export const updateBillSchema = z.object({
  amount: z.number().positive('Monto debe ser positivo').optional(),
  currency: currencySchema.optional(),
  dueDate: z.union([dateSchema, dateOnlySchema]).optional(),
  status: statusSchema.optional(),
  payments: z.array(z.object({
    amount: z.number().positive(),
    currency: currencySchema.optional(),
    exchangeRate: z.number().positive().optional(),
    paidAt: dateSchema.optional(),
    paymentMethodId: uuidSchema.optional(),
    description: z.string().max(500).optional()
  })).optional()
});

export const billQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: statusSchema.optional(),
  serviceId: uuidSchema.optional(),
  recurrence: recurrenceSchema.optional(),
  sort: z.enum(['dueDate', 'amount', 'status', 'name']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(2000)).optional()
});

// ============================================================================
// SERVICES
// ============================================================================

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(255, 'Nombre muy largo'),
  description: z.string().max(1000, 'Descripción muy larga').optional(),
  url: z.string().url('URL inválida').optional().or(z.literal('')),
  iconKey: z.string().max(50).optional(),
  customIconUrl: z.string().url('URL de ícono inválida').optional().or(z.literal('')),
  customIconKey: z.string().max(50).optional(),
  categoryId: z.string('Nombre es requerido').uuid('ID de categoría inválido'),
  paymentMethodId: uuidSchema.optional(),
  paymentProvider: z.string().max(100).optional(),
  recurrence: recurrenceSchema.optional(),
  autoRenew: z.boolean().optional(),
  defaultCurrency: currencySchema.optional(),
  archived: z.boolean().optional(),
  // Para creación de bill anidada
  amount: z.number().positive().optional(),
  dueDate: z.union([dateSchema, dateOnlySchema]).optional()
});

export const updateServiceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  url: z.string().url().optional().or(z.literal('')),
  iconKey: z.string().max(50).optional(),
  customIconUrl: z.string().url().optional().or(z.literal('')),
  customIconKey: z.string().max(50).optional(),
  categoryId: uuidSchema.optional().nullable(),
  paymentMethodId: uuidSchema.optional().nullable(),
  paymentProvider: z.string().max(100).optional(),
  recurrence: recurrenceSchema.optional(),
  autoRenew: z.boolean().optional(),
  defaultCurrency: currencySchema.optional(),
  archived: z.boolean().optional()
});

// ============================================================================
// PAYMENTS
// ============================================================================

export const createPaymentSchema = z.object({
  billId: uuidSchema.optional(),
  amount: z.number().positive('Monto debe ser positivo'),
  currency: currencySchema.optional(),
  exchangeRate: z.number().positive().optional(),
  paidAt: dateSchema.optional(),
  paymentMethodId: uuidSchema.optional(),
  description: z.string().max(500).optional()
});

export const updatePaymentSchema = z.object({
  amount: z.number().positive().optional(),
  currency: currencySchema.optional(),
  exchangeRate: z.number().positive().optional(),
  paidAt: dateSchema.optional(),
  paymentMethodId: uuidSchema.optional(),
  description: z.string().max(500).optional()
});

// ============================================================================
// ACCOUNTS
// ============================================================================

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(100, 'Nombre muy largo'),
  description: z.string().max(500).optional(),
  type: z.string().min(1, 'Tipo es requerido').max(50),
  balance: z.number().optional(),
  currency: currencySchema.optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).optional()
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: z.string().min(1).max(50).optional(),
  balance: z.number().optional(),
  currency: currencySchema.optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).optional()
});

export const createIncomeSchema = z.object({
  accountId: uuidSchema,
  amount: z.number().positive('Monto debe ser positivo'),
  description: z.string().min(1, 'Descripción requerida').max(500),
  date: dateSchema.optional()
});

export const createTransferSchema = z.object({
  fromAccountId: uuidSchema,
  toAccountId: uuidSchema,
  amount: z.number().positive('Monto debe ser positivo'),
  currency: currencySchema.optional(),
  description: z.string().max(500).optional(),
  transferDate: dateSchema.optional()
}).refine(data => data.fromAccountId !== data.toAccountId, {
  message: 'Las cuentas origen y destino deben ser diferentes',
  path: ['toAccountId']
});

export const createWithdrawalSchema = z.object({
  accountId: uuidSchema,
  amount: z.number().positive('Monto debe ser positivo'),
  description: z.string().min(1, 'Descripción requerida').max(500),
  date: dateSchema.optional()
});

// ============================================================================
// REMINDER PREFERENCES
// ============================================================================

export const reminderPreferencesSchema = z.object({
  reminderEnabled: z.boolean().optional(),
  reminderWindowDays: z.number().int().positive('Días debe ser un entero positivo').min(1, 'Debe ser al menos 1').max(30, 'Máximo 30 días').optional(),
  reminderChannel: z.enum(['email', 'push'], { message: 'Canal inválido' }).optional()
});

// ============================================================================
// PAYMENT METHODS
// ============================================================================

export const createPaymentMethodSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  accountId: uuidSchema.optional()
});

export const updatePaymentMethodSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  accountId: uuidSchema.optional().nullable()
});

// ============================================================================
// CATEGORIES
// ============================================================================

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(100),
  description: z.string().max(500).optional(),
  color: z.string().max(20).optional(),
  icon: z.string().max(50).optional()
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  color: z.string().max(20).optional(),
  icon: z.string().max(50).optional()
});

// ============================================================================
// AUTH
// ============================================================================

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(1, 'Nombre es requerido').max(100)
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña es requerida')
});

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const createNotificationSchema = z.object({
  type: z.string().max(50).optional(),
  title: z.string().min(1, 'Título es requerido').max(200),
  message: z.string().min(1, 'Mensaje es requerido').max(1000),
  actionUrl: z.string().url().optional().or(z.literal(''))
});
