import express from 'express';
import * as accountController from '../controllers/accountController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { 
  createAccountSchema, 
  updateAccountSchema,
  createIncomeSchema,
  createTransferSchema,
  createWithdrawalSchema 
  , reminderPreferencesSchema
} from '../validation/schemas.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas de cuentas
router.use(requireAuth);

// Rutas CRUD básicas
router.get('/', accountController.getAllAccounts);

// Ruta para obtener balances
router.get('/balance/summary', accountController.getBalances);

// Ruta para registrar ingresos
router.post('/income', validate(createIncomeSchema), accountController.registerIncome);
// Ruta para crear transferencias
router.post('/transfers', validate(createTransferSchema), accountController.createTransfer);
// Ruta para registrar retiros/egresos
router.post('/withdraw', validate(createWithdrawalSchema), accountController.registerWithdrawal);

// Nuevas rutas para listar ingresos y transferencias
router.get('/incomes', accountController.listIncomes);
router.get('/transfers', accountController.listTransfers);

// Actualizar preferencias de reminder (user must be authenticated)
router.get('/reminder/preferences', accountController.getReminderPreferences);
router.put('/reminder/preferences', validate(reminderPreferencesSchema), accountController.updateReminderPreferences);


router.get('/:id', accountController.getAccountById);
router.post('/', validate(createAccountSchema), accountController.createAccount);
router.put('/:id', validate(updateAccountSchema), accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

// Rutas para gestionar vinculación de métodos de pago
router.post('/link-payment-method', accountController.linkPaymentMethod);
router.delete('/unlink-payment-method/:paymentMethodId', accountController.unlinkPaymentMethod);


export default router;
